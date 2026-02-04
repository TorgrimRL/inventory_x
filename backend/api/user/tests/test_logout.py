from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status

from api.tests.base import BaseAPITestCase
from api.user.contracts.logout import LOGOUT_RESPONSES

User = get_user_model()


class LogoutTests(BaseAPITestCase):
    def setUp(self):
        self.logout_url = reverse("logout")
        self.user = self.create_user(email="user@test.com", password="password")

    def test_logout_ok(self):
        """
        Ensure auth users sessions is closed, on logout.
        """

        self.client.force_login(user=self.user)

        res = self.client.post(self.logout_url)
        data = self.assert_contract(res, LOGOUT_RESPONSES, status.HTTP_200_OK)
        self.assertEqual(data["detail"], "Session closed")

    def test_logout_failed(self):
        """
        Not auth user, should returns HTTP_403_FORBIDDEN.
        """
        res = self.client.post(self.logout_url)
        self.assert_contract(res, LOGOUT_RESPONSES, status.HTTP_403_FORBIDDEN)
