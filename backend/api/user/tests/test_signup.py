from typing import Any

from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.signup import SIGNUP_RESPONSES
from api.user.models import User


class SignupTests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("signup")
        self.valid_payload = {
            "email": "new.user@test.com",
            "password": "StrongPassword123!",
            "display_name": "New User",
        }

    def test_signup_success(self):
        """
        Test that a valid payload creates a user in the database.
        """
        response = self.client.post(self.url, self.valid_payload)

        self.assert_contract(
            response, SIGNUP_RESPONSES, status.HTTP_201_CREATED
        )

        # Verify the user exists
        user = User.objects.filter(email=self.valid_payload["email"]).first()
        self.assertIsNotNone(user, "User was not persisted to the database")

        assert user

        # Verify fields were saved correctly
        self.assertEqual(user.display_name, self.valid_payload["display_name"])

        # Verify password was hashed
        self.assertTrue(user.check_password(self.valid_payload["password"]))
        self.assertNotEqual(user.password, self.valid_payload["password"])

    def test_signup_optional_fields(self):
        """
        Test that creating an account without a display_name works.
        """
        payload = self.valid_payload.copy()
        del payload["display_name"]

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, SIGNUP_RESPONSES, status.HTTP_201_CREATED
        )

        user = User.objects.get(email=payload["email"])
        self.assertEqual(
            user.display_name, "", "Display name should default to empty string"
        )

    def test_signup_duplicate_email(self):
        """
        Test attempting to create an account for an email that already exists.
        """
        self.create_user(email=self.valid_payload["email"])

        response = self.client.post(self.url, self.valid_payload)

        data = self.assert_contract(
            response, SIGNUP_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        errors = data.get("detail", {})
        self.assertIn("email", errors)

    def test_signup_bad_formatting(self):
        """
        Test various invalid payload scenarios.
        """
        scenarios: list[tuple[dict[str, Any], list[str]]] = [
            # Empty Body
            ({}, ["email", "password"]),
            # Missing Password
            ({"email": "valid@test.com"}, ["password"]),
            # Missing Email
            ({"password": "pass"}, ["email"]),
            # Invalid Email Format
            ({"email": "not-an-email", "password": "pass"}, ["email"]),
            # Empty Password
            ({"email": "valid@test.com", "password": ""}, ["password"]),
        ]

        for payload, expected_keys in scenarios:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload)

                data = self.assert_contract(
                    response, SIGNUP_RESPONSES, status.HTTP_400_BAD_REQUEST
                )

                errors = data.get("detail", {})
                for key in expected_keys:
                    self.assertIn(
                        key,
                        errors,
                        f"Expected error in '{key}' but got: "
                        f"{list(errors.keys())}",
                    )

                # Verify no user was created
                if "email" in payload and payload["email"] != "not-an-email":
                    self.assertFalse(
                        User.objects.filter(email=payload["email"]).exists()
                    )
