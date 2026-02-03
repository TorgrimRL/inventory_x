from typing import Any

from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts import LOGIN_RESPONSES


class LoginTests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("login")
        self.user = self.create_user(email="user@test.com", password="k123m456")
        self.valid_payload = {"email": "user@test.com", "password": "k123m456"}

    def test_login_success(self):
        """Login happy case"""
        response = self.client.post(self.url, self.valid_payload)

        data = self.assert_contract(
            response, LOGIN_RESPONSES, status.HTTP_200_OK
        )

        self.assertIsNotNone(response.cookies.get("sessionid"))
        self.assertEqual(data["username"], str(self.user))

    def test_login_bad_formatting(self):
        scenarios: list[tuple[dict[str, Any], list[str]]] = [
            # Empty Body
            ({}, ["email", "password"]),
            # Bad email
            ({"email": "bad", "password": "x"}, ["email"]),
            # Missing email
            ({"password": "blank"}, ["email"]),
            # Missing password
            ({"email": self.valid_payload["email"]}, ["password"]),
        ]

        for payload, expected_keys in scenarios:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload)

                data = self.assert_contract(
                    response, LOGIN_RESPONSES, status.HTTP_400_BAD_REQUEST
                )

                errors = data.get("detail", {})

                for key in expected_keys:
                    self.assertIn(
                        key,
                        errors,
                        f"Expected error in '{key}' but got: "
                        f"{list(errors.keys())}",
                    )
                self.assertIsNone(response.cookies.get("sessionid"))

    def test_login_nonexistent_user(self):
        payload = {"email": "fake@user.com", "password": "LetMeIn"}
        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, LOGIN_RESPONSES, status.HTTP_401_UNAUTHORIZED
        )
        self.assertIsNone(response.cookies.get("sessionid"))

    def test_login_inactive_user(self):
        """
        Banned/Inactive users cannot obtain a session.
        """
        self.user.is_active = False
        self.user.save()

        response = self.client.post(self.url, self.valid_payload)

        self.assert_contract(
            response, LOGIN_RESPONSES, status.HTTP_401_UNAUTHORIZED
        )
        self.assertIsNone(response.cookies.get("sessionid"))
