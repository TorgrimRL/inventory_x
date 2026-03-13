from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.models import Inventory, InventoryMembership

User = get_user_model()


class ListMembersViewTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create(email="owner@example.com")
        self.employee = User.objects.create(email="employee@example.com")
        self.other_user = User.objects.create(email="other@example.com")

        self.inventory = Inventory.objects.create(
            name="Ola AS",
            org_number="123456789",
        )
        self.other_inventory = Inventory.objects.create(
            name="Kari AS",
            org_number="987654321",
        )

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
        self.other_inventory_membership = InventoryMembership.objects.create(
            inventory=self.other_inventory,
            user=self.other_user,
            role=InventoryMembership.Role.EMPLOYEE,
        )

    def _authenticate_with_active_inventory(self, user, inventory):
        self.client.force_authenticate(user=user)
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(inventory.id)
        session.save()

    def test_owner_can_list_members_for_active_inventory(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse("inventory-members")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        assert isinstance(data, list)

        self.assertEqual(len(data), 2)

        for member in data:
            assert isinstance(member, dict)

        returned_ids = {str(member["id"]) for member in data}
        returned_emails = {str(member["email"]) for member in data}
        returned_roles = {str(member["role"]) for member in data}

        self.assertIn(str(self.owner_membership.id), returned_ids)
        self.assertIn(str(self.employee_membership.id), returned_ids)

        self.assertIn("owner@example.com", returned_emails)
        self.assertIn("employee@example.com", returned_emails)

        self.assertIn(InventoryMembership.Role.OWNER, returned_roles)
        self.assertIn(InventoryMembership.Role.EMPLOYEE, returned_roles)

    def test_unauthenticated_user_gets_403(self):
        url = reverse("inventory-members")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_employee_cannot_list_members(self):
        self._authenticate_with_active_inventory(self.employee, self.inventory)

        url = reverse("inventory-members")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_only_members_from_active_inventory_are_returned(self):
        self._authenticate_with_active_inventory(self.owner, self.inventory)

        url = reverse("inventory-members")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.data
        assert isinstance(data, list)

        for member in data:
            assert isinstance(member, dict)

        returned_ids = {str(member["id"]) for member in data}

        self.assertIn(str(self.owner_membership.id), returned_ids)
        self.assertIn(str(self.employee_membership.id), returned_ids)
        self.assertNotIn(str(self.other_inventory_membership.id), returned_ids)
