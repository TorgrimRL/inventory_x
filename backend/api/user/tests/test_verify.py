from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts import VERIFY_RESPONSES


class VerifyTests(BaseAPITestCase):
    def setUp(self):
        self.verify_url = reverse("verify")
        self.user = self.create_user(email="user@test.com", password="password")

    def test_verify_authorized(self):
        """An authenticated user should get 200 OK"""
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.verify_url)

        data = self.assert_contract(
            response, VERIFY_RESPONSES, status.HTTP_200_OK
        )

        self.assertEqual(data["detail"], "Session is valid")
        self.assertEqual(data["username"], self.user.email)

    def test_verify_unauthorized(self):
        """An authenticated user should get 403 forbidden"""
        self.client.logout()

        response = self.client.get(self.verify_url)

        self.assert_contract(
            response, VERIFY_RESPONSES, status.HTTP_403_FORBIDDEN
        )
