from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.auth0 import AUTH0_RESPONSES


class Auth0Tests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("auth0-callback")

    def test_auth0_callback_returns_400_when_email_is_missing(self):
        response = self.client.post(
            self.url,
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
