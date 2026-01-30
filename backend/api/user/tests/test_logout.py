from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.user.serializers import LogoutResSerializer

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        # Assuming you have a url named 'verify' mapped to VerifyView
        self.verify_url = reverse("verify")

        self.email = "user@test.com"
        self.password = "k123m456"

        self.login_url = reverse("login")
        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
        )

    def _login(self, data):
        """helper to reduce boilerplate for login requests."""
        return self.client.post(
            self.login_url,
            data,
            content_type="application/json",
        )

    def test_logout_ok(self):
        """
        Ensure auth users sessions is closed, on logout.
        """
        data = {"email": self.email, "password": self.password}
        self._login(data)

        res = self.client.post(self.verify_url)
        serializer = LogoutResSerializer(data=res.json())

        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["detail"], "Sessions closed")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
