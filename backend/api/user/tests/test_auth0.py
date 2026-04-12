from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.auth0 import AUTH0_RESPONSES
from api.user.contracts.verify import VERIFY_RESPONSES


class Auth0Tests(BaseAPITestCase):
    def setUp(self):
        self.callback_url = reverse("auth0-callback")
        self.start_url = reverse("auth0-start")

    def test_auth0_callback_returns_400_when_email_is_missing(self):
        response = self.client.post(
            self.callback_url,
            {
                "provider_id": "google-oauth2|123",
                "display_name": "Test User",
            },
        )

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        self.assertIn("email", data["detail"])
        self.assertIsNone(response.cookies.get("sessionid"))

    def test_auth0_start_redirects_to_auth0_authorize_url(self):
        response = self.client.get(self.start_url)

        self.assertEqual(response.status_code, 302)

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

    def test_auth0_callback_returns_400_when_code_is_missing(self):
        response = self.client.get(self.callback_url)

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn("code", data["detail"])
        self.assertIsNone(response.cookies.get("sessionid"))

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_returns_200_when_code_exchange_succeeds(
            self, mock_exchange
    ):
        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code"},
        )

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_200_OK
        )

        self.assertEqual(data["username"], "social@test.com")

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_creates_user_when_code_exchange_succeeds(
            self, mock_exchange
    ):
        User = get_user_model()

        self.assertFalse(User.objects.filter(email="social@test.com").exists())

        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code"},
        )

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_200_OK
        )

        self.assertTrue(User.objects.filter(email="social@test.com").exists())
        self.assertEqual(data["username"], "social@test.com")

    from unittest.mock import patch

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_reuses_existing_user_when_email_matches(
            self, mock_exchange
    ):
        User = get_user_model()

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
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code"},
        )

        data = self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_200_OK
        )

        self.assertEqual(User.objects.filter(email="social@test.com").count(), 1)
        self.assertEqual(data["username"], "social@test.com")

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_auth0_callback_creates_session_when_code_exchange_succeeds(
            self, mock_exchange
    ):
        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
        }

        response = self.client.get(
            self.callback_url,
            {"code": "valid-code"},
        )

        self.assert_contract(
            response, AUTH0_RESPONSES, status.HTTP_200_OK
        )
        self.assertIsNotNone(response.cookies.get("sessionid"))

    from unittest.mock import patch

    @patch("api.user.views.auth0.exchange_auth0_code")
    def test_verify_succeeds_after_auth0_callback(
            self, mock_exchange
    ):
        mock_exchange.return_value = {
            "email": "social@test.com",
            "provider_id": "google-oauth2|123",
            "display_name": "Social User",
        }

        callback_response = self.client.get(
            self.callback_url,
            {"code": "valid-code"},
        )

        self.assert_contract(
            callback_response, AUTH0_RESPONSES, status.HTTP_200_OK
        )
        self.assertIsNotNone(callback_response.cookies.get("sessionid"))

        verify_response = self.client.get(reverse("verify"))

        verify_data = self.assert_contract(
            verify_response, VERIFY_RESPONSES, status.HTTP_200_OK
        )

        self.assertEqual(verify_data["username"], "Social User")
