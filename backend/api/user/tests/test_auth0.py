from typing import Any, cast
from unittest.mock import patch
from urllib.parse import parse_qs, urlencode, urlparse

from django.conf import settings
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.auth0 import AUTH0_RESPONSES
from api.user.contracts.verify import VERIFY_RESPONSES
from api.user.models import User


class Auth0Tests(BaseAPITestCase):
    def setUp(self):
        self.callback_url = reverse("auth0-callback")
        self.start_url = reverse("auth0-start")

    def _start_auth0_flow(self) -> str:
        response = self.client.get(self.start_url)
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        location = response["Location"]
        query = parse_qs(urlparse(location).query)
        return query["state"][0]

    def test_auth0_start_redirects_to_auth0_authorize_url(self):
        response = self.client.get(self.start_url)

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

        location = response["Location"]
        parsed = urlparse(location)
        query = parse_qs(parsed.query)

        self.assertEqual(parsed.scheme, "https")
        self.assertEqual(parsed.netloc, settings.AUTH0_DOMAIN)
        self.assertEqual(parsed.path, "/authorize")

        self.assertEqual(query["client_id"], [settings.AUTH0_CLIENT_ID])
        self.assertEqual(query["redirect_uri"], [settings.AUTH0_CALLBACK_URL])
        self.assertEqual(query["response_type"], ["code"])
        self.assertIn("openid", query["scope"][0])
        self.assertIn("state", query)
        self.assertTrue(query["state"][0])
        self.assertEqual(
            self.client.session["auth0_oauth_state"],
            query["state"][0],
        )

    def test_auth0_callback_returns_400_when_code_is_missing(self):
        state = self._start_auth0_flow()

        response = self.client.get(
            self.callback_url,
            {"state": state},
        )

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        self.assertIn("code", data["detail"])
        self.assertNotIn("_auth_user_id", self.client.session)

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_redirects_when_code_exchange_succeeds(
        self, mock_exchange
    ):
        state = self._start_auth0_flow()

        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
            "picture": "https://example.com/avatar.png",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code", "state": state},
        )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(
            response["Location"],
            settings.AUTH0_LOGIN_SUCCESS_RETURN_TO,
        )

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_creates_user_when_code_exchange_succeeds(
        self, mock_exchange
    ):
        state = self._start_auth0_flow()

        self.assertFalse(User.objects.filter(email="social@test.com").exists())

        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
            "picture": "https://example.com/avatar.png",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code", "state": state},
        )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(
            response["Location"],
            settings.AUTH0_LOGIN_SUCCESS_RETURN_TO,
        )

        user = User.objects.get(email="social@test.com")
        self.assertEqual(user.display_name, "Social User")
        self.assertFalse(user.has_usable_password())

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_reuses_existing_user_when_email_matches(
        self, mock_exchange
    ):
        state = self._start_auth0_flow()

        existing_user = User(
            email="social@test.com",
            display_name="Existing User",
        )
        existing_user.set_unusable_password()
        existing_user.save()

        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
            "picture": "https://example.com/avatar.png",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code", "state": state},
        )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(
            response["Location"],
            settings.AUTH0_LOGIN_SUCCESS_RETURN_TO,
        )

        self.assertEqual(
            User.objects.filter(email="social@test.com").count(), 1
        )

        reused_user = User.objects.get(email="social@test.com")
        self.assertEqual(reused_user.display_name, "Existing User")

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_creates_session_when_code_exchange_succeeds(
        self, mock_exchange
    ):
        state = self._start_auth0_flow()

        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
            "picture": "https://example.com/avatar.png",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code", "state": state},
        )

        self.assertEqual(response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(
            response["Location"],
            settings.AUTH0_LOGIN_SUCCESS_RETURN_TO,
        )
        self.assertIn("_auth_user_id", self.client.session)

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_verify_succeeds_after_auth0_callback(self, mock_exchange):
        state = self._start_auth0_flow()

        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
            "picture": "https://example.com/avatar.png",
        }

        callback_response = self.client.get(
            self.callback_url,
            {"code": "valid-code", "state": state},
        )

        self.assertEqual(callback_response.status_code, status.HTTP_302_FOUND)
        self.assertEqual(
            callback_response["Location"],
            settings.AUTH0_LOGIN_SUCCESS_RETURN_TO,
        )
        self.assertIn("_auth_user_id", self.client.session)

        verify_response = self.client.get(reverse("verify"))

        verify_data = self.assert_contract(
            verify_response, VERIFY_RESPONSES, status.HTTP_200_OK
        )

        self.assertEqual(verify_data["username"], "Social User")

    def test_auth0_callback_returns_400_when_state_is_invalid(self):
        self._start_auth0_flow()

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code", "state": "wrong-state"},
        )

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        self.assertIn("state", data["detail"])
        self.assertNotIn("_auth_user_id", self.client.session)

        verify_response = self.client.get(reverse("verify"))
        self.assertEqual(verify_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_logout_returns_auth0_logout_url_for_auth0_session(self):
        user = User.objects.create_user(
            email="logout-social@test.com",
            password="secret123",
            display_name="Logout User",
        )
        self.client.force_login(user)

        session = self.client.session
        session["auth_provider"] = "auth0"
        session.save()

        response = self.client.post(reverse("logout"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_params = {
            "client_id": settings.AUTH0_CLIENT_ID,
            "returnTo": settings.AUTH0_LOGOUT_RETURN_TO,
        }
        expected_url = (
            f"https://{settings.AUTH0_DOMAIN}/v2/logout?"
            f"{urlencode(expected_params)}"
        )

        if settings.AUTH0_FEDERATED_LOGOUT:
            expected_url = f"{expected_url}&federated"

        data = cast(dict[str, Any], response.data)
        self.assertEqual(data["logout_url"], expected_url)

    @patch("api.user.views.logout.settings.AUTH0_FEDERATED_LOGOUT", True)
    def test_logout_url_includes_federated_when_enabled(self):
        user = User.objects.create_user(
            email="logout-federated@test.com",
            password="secret123",
            display_name="Federated Logout User",
        )
        self.client.force_login(user)

        session = self.client.session
        session["auth_provider"] = "auth0"
        session.save()

        response = self.client.post(reverse("logout"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        expected_params = {
            "client_id": settings.AUTH0_CLIENT_ID,
            "returnTo": settings.AUTH0_LOGOUT_RETURN_TO,
        }
        expected_url = (
            f"https://{settings.AUTH0_DOMAIN}/v2/logout?"
            f"{urlencode(expected_params)}&federated"
        )

        data = cast(dict[str, Any], response.data)
        self.assertEqual(data["logout_url"], expected_url)
