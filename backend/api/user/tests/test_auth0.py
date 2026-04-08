from rest_framework import status
from rest_framework.test import APITestCase


class Auth0LoginTests(APITestCase):
    def test_auth0_callback_returns_400_when_email_is_missing(self):
        response = self.client.post(
            "/api/user/auth0/callback/",
            {
                "provider_id": "google-oauth2|123",
                "display_name": "Test User",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
