import uuid

from django.core.exceptions import ValidationError
from django.test import TestCase

from api.user.models import User

manager = User.objects


class UserModelTests(TestCase):
    # ----------------------------------------------------------------------
    # Manager Tests
    # ----------------------------------------------------------------------

    def test_create_user_happy_path(self):
        """Test creating a valid user sets all fields correctly."""
        email = "ValidUser@Example.com"
        password = "strong_password_123"

        user = manager.create_user(email=email, password=password)

        # Check persistence
        self.assertIsNotNone(user.pk)

        # Check normalization
        self.assertEqual(user.email, "validuser@example.com")

        # Check security
        self.assertTrue(user.check_password(password))
        self.assertNotEqual(user.password, password)  # Raw password not stored

        # Check defaults
        self.assertTrue(user.is_active)
        self.assertIsInstance(user.id, uuid.UUID)

    def test_create_user_requires_password(self):
        """Reject empty passwords"""
        with self.assertRaisesMessage(ValueError, "Password must be set"):
            manager.create_user(email="user@example.com", password="")

    def test_create_user_requires_email(self):
        """Reject empty emails"""
        with self.assertRaises(ValidationError):
            manager.create_user(email="", password="pass123")

    def test_create_user_enforces_email_validation(self):
        """Ensures email format is valid."""
        invalid_emails = [
            "not-an-email",
            "user@",
            "@domain.com",
            "user@domain",
        ]
        for email in invalid_emails:
            with self.subTest(email=email) and self.assertRaises(
                ValidationError
            ):
                manager.create_user(email=email, password="pass123")

    def test_create_user_enforces_uniqueness(self):
        """Ensures duplicate emails cannot be created (case-insensitive)."""
        email = "unique@example.com"
        u = manager.create_user(email=email, password="pass123")
        print(u.email)
        # Try creating the same user again (different case should still fail)
        with self.assertRaises(ValidationError):
            b = manager.create_user(email=email.upper(), password="pass456")
            print(b.email)

    # ----------------------------------------------------------------------
    # Model Instance Tests
    # ----------------------------------------------------------------------

    def test_model_direct_save_normalizes_email(self):
        """
        Saving a model directly (bypassing factory) should still normalize
        email.
        """
        user = User(email="DirectSave@Test.Com")
        user.set_password("pass123")
        user.save()

        user.refresh_from_db()
        self.assertEqual(user.email, "directsave@test.com")

    def test_model_update_normalizes_email(self):
        """Updating an existing user's email should trigger normalization."""
        user = manager.create_user(
            email="original@test.com", password="pass123"
        )

        user.email = "NEW@TEST.COM"
        user.save()

        user.refresh_from_db()
        self.assertEqual(user.email, "new@test.com")

    def test_str_method_behavior(self):
        """__str__ should prefer display_name, fall back to email."""
        # Case 1: Display Name present
        user_with_name = manager.create_user(
            email="a@test.com", password="pw", display_name="John Doe"
        )
        self.assertEqual(str(user_with_name), "John Doe")

        # Case 2: No Display Name
        user_no_name = manager.create_user(
            email="b@test.com", password="pw", display_name=""
        )
        self.assertEqual(str(user_no_name), "b@test.com")

    def test_ordering(self):
        """Users should be ordered by email alphabetically."""
        u1 = manager.create_user(email="c@test.com", password="pw")
        u2 = manager.create_user(email="a@test.com", password="pw")
        u3 = manager.create_user(email="b@test.com", password="pw")

        users = list(User.objects.all())
        self.assertEqual(users, [u2, u3, u1])  # a, b, c

    def test_defaults(self):
        """Ensure default values for ID and is_active are correct."""
        user = User(email="defaults@test.com")
        # ID is generated on instantiation
        self.assertIsInstance(user.id, uuid.UUID)
        # is_active should default to True
        self.assertTrue(user.is_active)

    def test_display_name_defaults_to_empty_string(self):
        """Display name should be an empty string, not None, if omitted."""
        user = manager.create_user(email="empty@test.com", password="pw")
        self.assertEqual(user.display_name, "")

    def test_fail_on_incorrect_password(self):
        """Ensure checking wrong password returns false"""
        u = manager.create_user(email="b@example.com", password="pass123")
        self.assertFalse(u.check_password("pass321"))

    def test_model_configures_email_as_username(self):
        """Ensure email is configured to be username"""
        self.assertEqual(User.USERNAME_FIELD, "email")
