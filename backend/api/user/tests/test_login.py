from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.user.models import User
from api.user.serializers import (
    ErrorResponseSerializer,
    LoginResponseSerializer,
    ValidationErrorResponseSerializer,
)


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
        """
        Valid credentials should return 200 and match LoginResponseSerializer.
        """
        data = {"email": self.email, "password": self.password}
        res = self._login(data)

        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("sessionid", res.cookies)

        serializer = LoginResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data["username"], str(self.user))

    # --- Validation Errors (400 Bad Request) ---

    def test_login_empty_body(self):
        """
        Empty request body should return 400 and match
        ValidationErrorResponseSerializer
        """
        res = self._login({})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        serializer = ValidationErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())

    def test_login_missing_password(self):
        """
        Missing password field should match ValidationErrorResponseSerializer.
        """
        res = self._login({"email": self.email})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        serializer = ValidationErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())
        self.assertIn("password", serializer.validated_data["detail"])

    def test_login_missing_email(self):
        """Missing email field should return 400."""
        res = self._login({"email": self.email})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        serializer = ValidationErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())
        self.assertIn("password", serializer.validated_data["detail"])

    def test_login_invalid_email_format(self):
        """
        Invalid email format should match ValidationErrorResponseSerializer.
        """
        res = self._login({"email": "not-an-email", "password": "pass"})

        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        serializer = ValidationErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())
        self.assertIn("email", serializer.validated_data["detail"])

    # --- Authentication Failures (401 Unauthorized) ---

    def test_auth_invalid_password(self):
        """Wrong password should match ErrorResponseSerializer."""
        data = {"email": self.email, "password": "wrongpassword"}
        res = self._login(data)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("sessionid", res.cookies)

        serializer = ErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())

        self.assertEqual(
            serializer.validated_data["detail"], "Invalid credentials"
        )

    def test_auth_user_not_found(self):
        """Non-existent user should return 401."""
        data = {"email": "ghost@test.com", "password": self.password}
        res = self._login(data)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("sessionid", res.cookies)

        serializer = ErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())

        self.assertEqual(
            serializer.validated_data["detail"], "Invalid credentials"
        )

    def test_auth_inactive_user(self):
        """
        Inactive user should be denied login (401) and match
        ErrorResponseSerializer.
        """
        self.user.is_active = False
        self.user.save()

        data = {"email": self.email, "password": self.password}
        res = self._login(data)

        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("sessionid", res.cookies)

        serializer = ErrorResponseSerializer(data=res.json())
        self.assertTrue(serializer.is_valid())

        self.assertEqual(
            serializer.validated_data["detail"], "Invalid credentials"
        )
