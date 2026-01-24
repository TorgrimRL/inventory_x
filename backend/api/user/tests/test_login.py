from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

User = get_user_model()


class AuthTests(APITestCase):
    def setUp(self):
        """
        - Runs before every test.
        - Database is reset after each test.
        """
        self.user = User.objects.create_user(
            email="user@test.com",
            password="k123m456",
        )

    def test_login_new_session(self):
        res = self.client.post(
            reverse("login"),
            {"email": "user@test.com", "password": "k123m456"},
            content_type="application/json",
        )

        self.assertEqual(res.status_code, 200)
        self.assertIn("sessionid", res.cookies)

    def test_login_invalid_password(self):
        res = self.client.post(
            reverse("login"),
            {"email": "user@test.com", "password": "wrongpassword"},
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 401)
        self.assertNotIn("sessionid", res.cookies)
        self.assertEqual(res.data["error"], "Invalid credentials")

    def test_login_user_not_found(self):
        res = self.client.post(
            reverse("login"),
            {"email": "nonexistent@test.com", "password": "k123m456"},
            content_type="application/json",
        )

        self.assertEqual(res.status_code, 401)
        self.assertEqual(res.data["error"], "Invalid credentials")
