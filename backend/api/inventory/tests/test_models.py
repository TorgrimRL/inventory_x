import uuid
from unittest.mock import patch

from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.test import TestCase

from api.inventory.models import (
    Inventory,
    InventoryAlreadyExistsError,
    InventoryItem,
    InventoryMembership,
)
from api.user.models import User


class InventoryModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="owner@example.com",
            password="pass123",
        )

    # ----------------------------------------------------------------------
    # Classmethod / Factory Tests
    # ----------------------------------------------------------------------

    def test_register_with_owner_happy_path(self):
        """register_with_owner should create inventory + owner membership."""
        inventory, membership = Inventory.register_with_owner(
            user=self.user,
            name="My Inventory",
            org_number="123456789",
        )

        # Persistence
        self.assertIsNotNone(inventory.pk)
        self.assertIsInstance(inventory.id, uuid.UUID)

        # Fields
        self.assertEqual(inventory.name, "My Inventory")
        self.assertEqual(inventory.org_number, "123456789")
        self.assertIsNotNone(inventory.created_at)

        # Membership created correctly
        self.assertIsNotNone(membership.pk)
        self.assertEqual(membership.inventory, inventory)
        self.assertEqual(membership.user, self.user)
        self.assertEqual(membership.role, InventoryMembership.Role.OWNER)
        self.assertIsNotNone(membership.created_at)

        # Related name works
        self.assertEqual(inventory.memberships.count(), 1)
        self.assertEqual(
            inventory.memberships.get(user=self.user).role, "owner"
        )

    def test_register_with_owner_rejects_invalid_org_number(self):
        """org_number must be exactly 9 digits."""
        invalid_orgs = [
            "",
            "123",
            "12345678",
            "1234567890",
            "abcdefghi",
            "1234abc89",
        ]

        for org in invalid_orgs:
            with self.subTest(org=org), self.assertRaises(ValidationError):
                Inventory.register_with_owner(
                    user=self.user,
                    name="Bad Inventory",
                    org_number=org,
                )

        self.assertEqual(Inventory.objects.count(), 0)
        self.assertEqual(InventoryMembership.objects.count(), 0)

    def test_register_with_owner_duplicate_org_number_raises_custom_error(self):
        """Duplicate org_number should raise InventoryAlreadyExistsError."""
        Inventory.register_with_owner(
            user=self.user,
            name="First",
            org_number="123456789",
        )

        with self.assertRaises(InventoryAlreadyExistsError):
            Inventory.register_with_owner(
                user=self.user,
                name="Second",
                org_number="123456789",
            )

        # Still only one inventory + one membership
        self.assertEqual(Inventory.objects.count(), 1)
        self.assertEqual(InventoryMembership.objects.count(), 1)

    def test_register_owner_atomic_rollback(self):
        """
        If the Inventory is saved but membership creation fails,
        the whole transaction must roll back (no Inventory persisted).
        """
        org_number = "999888777"

        with (
            patch(
                "api.inventory.models.InventoryMembership.objects.create",
                side_effect=IntegrityError("Simulated DB failure"),
            ),
            self.assertRaises(IntegrityError),
        ):
            Inventory.register_with_owner(
                user=self.user,
                name="Atomic Inventory",
                org_number=org_number,
            )

        # Inventory should not exist (rolled back)
        self.assertFalse(
            Inventory.objects.filter(org_number=org_number).exists()
        )
        self.assertEqual(InventoryMembership.objects.count(), 0)

    # ----------------------------------------------------------------------
    # Model Instance Tests
    # ----------------------------------------------------------------------

    def test_str_method_behavior(self):
        """__str__ should be 'Name (org_number)'."""
        inv = Inventory.objects.create(name="Store A", org_number="987654321")
        self.assertEqual(str(inv), "Store A (987654321)")


class InventoryMembershipModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="u@example.com",
            password="pass123",
        )
        self.inventory = Inventory.objects.create(
            name="Inv",
            org_number="111222333",
        )

    def test_unique_inventory_membership_constraint(self):
        """Same user cannot have duplicate membership for same inventory."""
        InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.user,
            role=InventoryMembership.Role.OWNER,
        )

        with self.assertRaises(IntegrityError), transaction.atomic():
            InventoryMembership.objects.create(
                inventory=self.inventory,
                user=self.user,
                role=InventoryMembership.Role.EMPLOYEE,
            )

        self.assertEqual(
            InventoryMembership.objects.filter(
                inventory=self.inventory,
                user=self.user,
            ).count(),
            1,
        )

    def test_str_method_behavior(self):
        """__str__ should contain the expected parts."""
        m = InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.user,
            role=InventoryMembership.Role.EMPLOYEE,
        )
        # Only check that it contains expected parts (User.__str__ can vary)
        s = str(m)
        self.assertIn("->", s)
        self.assertIn("as employee", s)


class InventoryItemModelTests(TestCase):
    def test_str_method_behavior(self):
        """__str__ should return the item name."""
        inv = Inventory.objects.create(
            name="Test Inventory", org_number="999999999"
        )
        item = InventoryItem.objects.create(
            inventory=inv, name="Widget", price=100, stock=5
        )
        self.assertEqual(str(item), "Widget")

    def test_defaults(self):
        """Default stock should be 0."""
        inv = Inventory.objects.create(
            name="Test Inventory", org_number="999999999"
        )
        item = InventoryItem.objects.create(
            inventory=inv,
            name="Widget",
            price=100,
        )
        self.assertEqual(item.stock, 0)


class InventoryRoleTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create(
            email="owner@example.com", password="pw"
        )
        self.employee = User.objects.create(
            email="employee@example.com", password="pw"
        )
        self.stranger = User.objects.create(
            email="stranger@example.com", password="pw"
        )

        self.inventory, _ = Inventory.register_with_owner(
            user=self.owner, name="Test Corp", org_number="123456789"
        )

        InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.employee,
            role=InventoryMembership.Role.EMPLOYEE,
        )

    def test_is_owner(self):
        self.assertTrue(self.inventory.is_owner(self.owner))
        self.assertFalse(self.inventory.is_owner(self.employee))
        self.assertFalse(self.inventory.is_owner(self.stranger))

    def test_is_employee(self):
        self.assertFalse(self.inventory.is_employee(self.owner))
        self.assertTrue(self.inventory.is_employee(self.employee))
        self.assertFalse(self.inventory.is_employee(self.stranger))

    def test_is_member(self):
        self.assertTrue(self.inventory.is_member(self.owner))
        self.assertTrue(self.inventory.is_member(self.employee))
        self.assertFalse(self.inventory.is_member(self.stranger))

    def test_checks_handle_unauthenticated_user(self):
        """Ensure methods don't crash if passed an AnonymousUser"""
        from django.contrib.auth.models import AnonymousUser

        anon = AnonymousUser()

        self.assertFalse(self.inventory.is_owner(anon))
        self.assertFalse(self.inventory.is_member(anon))
        self.assertFalse(self.inventory.is_employee(anon))
