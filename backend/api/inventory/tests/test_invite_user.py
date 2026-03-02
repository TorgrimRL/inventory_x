from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from api.inventory.contracts.invite_user import INVITE_USER_RESPONSES
from api.inventory.models import Inventory, InventoryMembership
from api.inventory.services.invite_user import invite_user
from api.tests.base import BaseAPITestCase
from api.user.models import User


class InviteUserServicesTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create(
            email="owner@example.com", password="password"
        )
        self.inventory, _ = Inventory.register_with_owner(
            user=self.owner, name="Test Corp", org_number="123456789"
        )
        self.target_user = User.objects.create(
            email="target@example.com", password="password"
        )

    def test_invite_user_success(self):
        """Owner can invite a user, who becomes an employee."""
        invite_user(self.owner, str(self.inventory.id), self.target_user.email)

        membership = InventoryMembership.objects.get(
            inventory=self.inventory, user=self.target_user
        )
        self.assertEqual(membership.role, InventoryMembership.Role.EMPLOYEE)

    def test_invite_user_not_owner_raises_permission_error(self):
        """Non-owners cannot invite users."""
        stranger = User.objects.create(
            email="stranger@example.com", password="password"
        )

        with self.assertRaises(PermissionError) as ctx:
            invite_user(
                stranger, str(self.inventory.id), self.target_user.email
            )

        self.assertIn("Only the inventory owner", str(ctx.exception))

    def test_invite_user_target_does_not_exist(self):
        """Inviting a non-existent email raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            invite_user(self.owner, str(self.inventory.id), "ghost@example.com")

        self.assertIn("does not exist", str(ctx.exception))

    def test_invite_user_already_member(self):
        """Inviting an existing member raises ValueError."""
        invite_user(self.owner, str(self.inventory.id), self.target_user.email)

        with self.assertRaises(ValueError) as ctx:
            invite_user(
                self.owner, str(self.inventory.id), self.target_user.email
            )

        self.assertIn("already a member", str(ctx.exception))


class TestInviteUserView(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.owner = User.objects.create(
            email="owner@example.com", password="password"
        )
        self.employee = User.objects.create(
            email="employee@example.com", password="password"
        )
        self.stranger = User.objects.create(
            email="stranger@example.com", password="password"
        )

        self.inventory, _ = Inventory.register_with_owner(
            user=self.owner,
            name="Test Corp",
            org_number="123456789",
        )
        self.url = reverse(
            "inventory-invite", kwargs={"inventory_id": self.inventory.id}
        )

    def test_invite_success(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"email": self.employee.email}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_200_OK
        )

        assert InventoryMembership.objects.filter(
            inventory=self.inventory,
            user=self.employee,
            role=InventoryMembership.Role.EMPLOYEE,
        ).exists()

    def test_invite_permission_denied_for_non_owner(self):
        self.client.force_authenticate(user=self.stranger)
        payload = {"email": self.employee.email}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_403_FORBIDDEN
        )

    def test_invite_invalid_email_format(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"email": "not-an-email"}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_invite_user_not_found(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"email": "ghost@example.com"}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_invite_inventory_not_found(self):
        self.client.force_authenticate(user=self.owner)

        import uuid

        url = reverse("inventory-invite", kwargs={"inventory_id": uuid.uuid4()})
        payload = {"email": self.employee.email}

        response = self.client.post(url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_404_NOT_FOUND
        )
