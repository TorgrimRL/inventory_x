from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.user.serializers import VerifySessionResponseSerializer

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        # Assuming you have a url named 'verify' mapped to VerifyView
        self.verify_url = reverse("verify")

        self.login_url = reverse("login")
        self.email = "user@test.com"
        self.password = "k123m456"

        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
        )

    def _login(self, data):
        """Helper to reduce boilerplate for login requests."""
        return self.client.post(
            self.login_url,
            data,
            content_type="application/json",
        )

    def test_verify_view_authorized(self):
        """
        Ensure an authenticated user gets a 200 OK and the expected data.
        """
        # Authenticate the request for this test

        data = {"email": self.email, "password": self.password}
        self._login(data)

        response = self.client.get(self.verify_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        serializer = VerifySessionResponseSerializer(data=response.json())
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["username"], str(self.user))
        self.assertEqual(
            serializer.validated_data["detail"], "Session is valid"
        )
        self.client.logout()

    def test_verify_view_unauthorized(self):
        """
        Ensure an unauthenticated user gets a 403 Forbidden (or 401).
        """
        # Ensure client is anonymous (no force_authenticate called)

        data = {"email": "ma@uit.no", "password": self.password}
        self._login(data)
        response = self.client.get(self.verify_url)

        # DRF 'IsAuthenticated' typically returns 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
