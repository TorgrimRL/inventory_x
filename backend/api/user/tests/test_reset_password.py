import re

from django.core import mail
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase


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
        self.assertEqual(response.status_code, status.HTTP_200_OK)

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
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Ensure NO email was sent
        self.assertEqual(len(mail.outbox), 0)

    def test_missing_param_400(self):
        """
        Scenario: No email param provided.
        Expectation: 400 Bad Request.
        """
        response = self.client.post(self.url)  # No query params
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
