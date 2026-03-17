import uuid

from django.urls import reverse

from api.inventory.contracts.delete_item import DELETE_ITEM_RESPONSES
from api.inventory.models import Inventory, InventoryItem, InventoryMembership
from api.tests.base import BaseAPITestCase


class ItemDetailViewDeleteTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

        self.owner = self.create_user(email="owner@test.com")
        self.employee = self.create_user(email="employee@test.com")

        self.inventory, _ = Inventory.register_with_owner(
            user=self.owner, name="Test Inv", org_number="123456789"
        )
        InventoryMembership.objects.create(
            user=self.employee,
            inventory=self.inventory,
            role=InventoryMembership.Role.EMPLOYEE,
        )

        self.item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Test Delete Item",
            price=100,
            stock=10,
            low_stock_threshold=5,
        )

        self.url = reverse("item-detail", kwargs={"item_id": self.item.id})

    def _set_active_inventory(self, user):
        """Helper to simulate the active inventory session state."""
        self.client.force_authenticate(user=user)
        session = self.client.session
        session["active_inventory_id"] = str(self.inventory.id)
        session.save()

    def test_delete_item_as_employee_forbidden(self):
        self._set_active_inventory(self.employee)

        response = self.client.delete(self.url)

        self.assert_contract(response, DELETE_ITEM_RESPONSES, 403)
        self.assertTrue(InventoryItem.objects.filter(id=self.item.id).exists())

    def test_delete_item_as_owner_success(self):
        self._set_active_inventory(self.owner)

        response = self.client.delete(self.url)

        self.assert_contract(response, DELETE_ITEM_RESPONSES, 204)
        self.assertFalse(InventoryItem.objects.filter(id=self.item.id).exists())

    def test_delete_item_not_found(self):
        self._set_active_inventory(self.owner)

        fake_url = reverse("item-detail", kwargs={"item_id": uuid.uuid4()})
        response = self.client.delete(fake_url)

        self.assert_contract(response, DELETE_ITEM_RESPONSES, 404)
