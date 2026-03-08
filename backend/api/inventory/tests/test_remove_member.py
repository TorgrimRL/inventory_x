from uuid import uuid4

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.models import Inventory, InventoryMembership

User = get_user_model()


class RemoveMemberViewTests(APITestCase):
    def setUp(self):
        # Users
        self.owner = User.objects.create(email="owner@example.com")
        self.employee = User.objects.create(email="employee@example.com")
        self.other_owner = User.objects.create(email="other-owner@example.com")
        self.other_employee = User.objects.create(
            email="other-employee@example.com"
        )

        # Inventories
        self.inventory = Inventory.objects.create(
            name="Ola AS",
            org_number="123456789",
        )

        self.other_inventory = Inventory.objects.create(
            name="Kari AS",
            org_number="987654321",
        )

        # Memberships
        self.owner_membership = InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.owner,
            role=InventoryMembership.Role.OWNER,
        )

        self.employee_membership = InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.employee,
            role=InventoryMembership.Role.EMPLOYEE,
        )

        self.other_owner_membership = InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.other_owner,
            role=InventoryMembership.Role.OWNER,
        )

        self.other_inventory_employee_membership = (
            InventoryMembership.objects.create(
                inventory=self.other_inventory,
                user=self.other_employee,
                role=InventoryMembership.Role.EMPLOYEE,
            )
        )

    def _authenticate_with_active_inventory(self, user, inventory):
        self.client.force_authenticate(user=user)
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(inventory.id)
        session.save()

    def test_owner_can_remove_employee_membership(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse(
            "remove-member",
            kwargs={"membership_id": self.employee_membership.id},
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data,
            {"message": "Employee access removed"},
        )
        self.assertFalse(
            InventoryMembership.objects.filter(
                id=self.employee_membership.id
            ).exists()
        )

    def test_unauthenticated_user_gets_403(self):
        url = reverse(
            "remove-member",
            kwargs={"membership_id": self.employee_membership.id},
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_remove_member(self):
        self._authenticate_with_active_inventory(self.employee, self.inventory)

        url = reverse(
            "remove-member",
            kwargs={"membership_id": self.owner_membership.id},
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(
            InventoryMembership.objects.filter(
                id=self.owner_membership.id
            ).exists()
        )

    def test_owner_cannot_remove_owner_membership(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse(
            "remove-member",
            kwargs={"membership_id": self.other_owner_membership.id},
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {"detail": "Only employee memberships can be removed."},
        )
        self.assertTrue(
            InventoryMembership.objects.filter(
                id=self.other_owner_membership.id
            ).exists()
        )

    def test_owner_cannot_remove_own_membership(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse(
            "remove-member",
            kwargs={"membership_id": self.owner_membership.id},
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.data,
            {"detail": "Owners cannot remove their own access."},
        )
        self.assertTrue(
            InventoryMembership.objects.filter(
                id=self.owner_membership.id
            ).exists()
        )

    def test_returns_404_when_membership_does_not_exist(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse(
            "remove-member",
            kwargs={"membership_id": uuid4()},
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.data,
            {"detail": "Membership not found"},
        )

    def test_returns_404_when_membership_belongs_to_other_inventory(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse(
            "remove-member",
            kwargs={
                "membership_id": self.other_inventory_employee_membership.id
            },
        )

        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.data,
            {"detail": "Membership not found"},
        )
        self.assertTrue(
            InventoryMembership.objects.filter(
                id=self.other_inventory_employee_membership.id
            ).exists()
        )

    def test_removed_employee_no_longer_has_access_to_inventory(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        remove_url = reverse(
            "remove-member",
            kwargs={"membership_id": self.employee_membership.id},
        )

        remove_response = self.client.delete(remove_url)
        self.assertEqual(remove_response.status_code, status.HTTP_200_OK)

        self.client.force_authenticate(user=self.employee)
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        inventory_url = reverse("inventory")
        response = self.client.get(inventory_url)

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
