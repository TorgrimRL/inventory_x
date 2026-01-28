from typing import Any

from django.urls import reverse

from api.tests.base import BaseAPITestCase
from api.user.contracts import LOGIN_RESPONSES


class LoginTests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("login")
        self.user = self.create_user(email="user@test.com", password="k123m456")
        self.valid_payload = {"email": "user@test.com", "password": "k123m456"}

    def test_login_success(self):
        response = self.client.post(self.url, self.valid_payload)

        data = self.assert_contract(response, LOGIN_RESPONSES)

        self.assertIsNotNone(response.cookies.get("sessionid"))
        self.assertEqual(data["username"], str(self.user))

    def test_login_failures(self):
        scenarios: list[tuple[dict[str, Any], str]] = [
            ({}, "email"),  # Empty
            ({"email": "bad", "password": "x"}, "email"),  # Bad Format
            (
                {"email": "user@test.com", "password": "wrong"},
                "Invalid credentials",
            ),
        ]

        for payload, expected_error in scenarios:
            with self.subTest(payload=payload):
                response = self.client.post(self.url, payload)
                data = self.assert_contract(response, LOGIN_RESPONSES)

                detail = data.get("detail")
                if isinstance(detail, dict):
                    self.assertIn(expected_error, detail)
                else:
                    self.assertEqual(detail, expected_error)

    def test_login_inactive_user(self):
        """
        Banned/Inactive users cannot obtain a session.
        """
        self.user.is_active = False
        self.user.save()

        response = self.client.post(self.url, self.valid_payload)

        data = self.assert_contract(response, LOGIN_RESPONSES)

        self.assertEqual(data["detail"], "Invalid credentials")
        self.assertIsNone(response.cookies.get("sessionid"))
