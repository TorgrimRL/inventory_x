from unittest.mock import patch
from urllib.parse import parse_qs, urlparse

from django.conf import settings
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.auth0 import AUTH0_RESPONSES


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
