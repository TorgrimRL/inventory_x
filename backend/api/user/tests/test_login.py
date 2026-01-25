from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.user.models import User


class AuthTests(APITestCase):
    def setUp(self):
        self.url = reverse("login")
        self.email = "user@test.com"
        self.password = "k123m456"

        self.user = User.objects.create_user(
            email=self.email,
            password=self.password,
        )

    def _login(self, data):
        """Helper to reduce boilerplate for login requests."""
        return self.client.post(
            self.url,
            data,
            content_type="application/json",
        )

    # --- Success Case ---

    def test_login_success(self):
        """Valid credentials should return 200 and set session cookie."""
        data = {"email": self.email, "password": self.password}
        res = self._login(data)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("sessionid", res.cookies)

    # --- Validation Errors (400 Bad Request) ---

    def test_login_empty_body(self):
        """Empty request body should return 400."""
        res = self._login({})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_missing_password(self):
        """Missing password field should return 400."""
        res = self._login({"email": self.email})
        response_json = res.json()

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response_json["detail"])

    def test_login_missing_email(self):
        """Missing email field should return 400."""
        res = self._login({"password": "somepassword"})
        response_json = res.json()

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response_json["detail"])

    def test_login_invalid_email_format(self):
        """Invalid email format should return 400."""
        res = self._login({"email": "not-an-email", "password": "pass"})
        response_json = res.json()

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response_json["detail"])

    # --- Authentication Failures (401 Unauthorized) ---

    def test_auth_invalid_password(self):
        """Wrong password should return 401."""
        data = {"email": self.email, "password": "wrongpassword"}
        res = self._login(data)
        response_json = res.json()

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("sessionid", res.cookies)
        self.assertEqual(response_json["detail"], "Invalid credentials")

    def test_auth_user_not_found(self):
        """Non-existent user should return 401."""
        data = {"email": "ghost@test.com", "password": self.password}
        res = self._login(data)
        response_json = res.json()

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response_json["detail"], "Invalid credentials")

    def test_auth_inactive_user(self):
        """Inactive user should be denied login (401)."""
        self.user.is_active = False
        self.user.save()

        data = {"email": self.email, "password": self.password}
        res = self._login(data)
        response_json = res.json()

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("sessionid", res.cookies)
        self.assertEqual(response_json["detail"], "Invalid credentials")
