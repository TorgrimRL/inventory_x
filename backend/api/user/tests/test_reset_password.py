import re
import secrets

from django.core import mail
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.password_reset import (
    PASSWORD_RESET_RESPONSES_POST,
    PASSWORD_RESET_RESPONSES_PUT,
)


class PasswordResetTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="user@example.com",
            password="password123",
        )
        self.url = reverse("password_reset")

    def test_sends_email_and_caches_token_200(self):
        """
        Scenario: Valid email is provided.
        Expectation: 200 OK, Email sent, Token stored in Redis.
        """
        response = self.client.post(f"{self.url}?email=user@example.com")
        self.assert_contract(
            response, PASSWORD_RESET_RESPONSES_POST, status.HTTP_200_OK
        )

        # Assert mail.
        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, ["user@example.com"])
        self.assertIn("Reset Password", email.subject)

        # Extract the Token.
        match = re.search(r"token=([a-f0-9]+)", email.body)
        self.assertTrue(match)
        assert match is not None
        token = match.group(1)

        # Verify the token is in cache
        cached_email = cache.get(token)
        self.assertEqual(cached_email, "user@example.com")

    def test_unknown_email_200(self):
        """
        Scenario: Email does not exist in DB.
        Expectation: 200 OK (security), but NO email sent.
        """
        response = self.client.post(f"{self.url}?email=hacker@example.com")
        self.assert_contract(
            response, PASSWORD_RESET_RESPONSES_POST, status.HTTP_200_OK
        )

        # Ensure NO email was sent
        self.assertEqual(len(mail.outbox), 0)

    def test_missing_param_400(self):
        """
        Scenario: No email param provided.
        Expectation: 400 Bad Request.
        """
        response = self.client.post(self.url)  # No query params
        self.assert_contract(
            response,
            PASSWORD_RESET_RESPONSES_POST,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_password_reset_success_200(self):
        """
        Scenario: Valid OTC and strong password provided via PUT.
        Expectation: 200 OK, Password hashed in DB, OTC burned from cache.
        """

        token = secrets.token_hex(32)
        cache.set(token, self.user.email, 60)

        # Call the PUT method
        data = {"OTC": token, "NEW_PASSWORD": "StrongNewPassword123!"}
        response = self.client.put(self.url, data, format="json")
        self.assert_contract(
            response,
            PASSWORD_RESET_RESPONSES_PUT,
            status.HTTP_200_OK,
        )

        # Verify in password DB is updated && cache is burned.
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("StrongNewPassword123!"))
        self.assertIsNone(cache.get(token))

    def test_weak_password_400(self):
        """
        Scenario: Valid OTC but password fails validation (too short).
        Expectation: 400 Bad Request.
        """
        token = secrets.token_hex(32)
        cache.set(token, self.user.email, timeout=60)

        data = {
            "OTC": token,
            "NEW_PASSWORD": "123",  # Fails MinimumLengthValidator
        }
        response = self.client.put(self.url, data, format="json")
        self.assert_contract(
            response,
            PASSWORD_RESET_RESPONSES_PUT,
            status.HTTP_400_BAD_REQUEST,
        )

        # Verify password did NOT change
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("123"))
