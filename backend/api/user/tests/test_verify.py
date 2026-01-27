from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        # Assuming you have a url named 'verify' mapped to VerifyView
        self.verify_url = reverse("verify")

        self.email = "user@test.com"
        self.password = "k123m456"

        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
        )

    def test_verify_view_authorized(self):
        """
        Ensure an authenticated user gets a 200 OK and the expected data.
        """
        # Authenticate the request for this test
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.verify_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["detail"], "Session is valid")
        self.assertEqual(response.data["username"], str(self.user))

    def test_verify_view_unauthorized(self):
        """
        Ensure an unauthenticated user gets a 403 Forbidden (or 401).
        """
        # Ensure client is anonymous (no force_authenticate called)
        self.client.logout()

        response = self.client.get(self.verify_url)

        # DRF 'IsAuthenticated' typically returns 403 Forbidden
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
