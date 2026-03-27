from typing import Any

from django.contrib.auth import get_user_model
from rest_framework import serializers, status

from api.inventory.models import (
    Inventory,
    InventoryCustomField,
    InventoryItem,
    InventoryMembership,
)
from api.tests.base import BaseAPITestCase

User = get_user_model()


# --- TDD Placeholders for Contracts ---
class DummySerializer(serializers.Serializer):
    def to_internal_value(self, data: Any) -> Any:
        return data

    def to_representation(self, instance: Any) -> Any:
        return instance


# Added dict[int, Any] type hints to satisfy assert_contract signature
CREATE_CUSTOM_FIELD_CONTRACT: dict[int, Any] = {
    status.HTTP_201_CREATED: DummySerializer,
    status.HTTP_400_BAD_REQUEST: DummySerializer,
}
CREATE_ITEM_CONTRACT: dict[int, Any] = {
    status.HTTP_201_CREATED: DummySerializer,
    status.HTTP_400_BAD_REQUEST: DummySerializer,
}
LIST_ITEMS_CONTRACT: dict[int, Any] = {status.HTTP_200_OK: DummySerializer}
# --------------------------------------


class InventoryCustomFieldsTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="owner@example.com",
            password="testpassword123",
            display_name="Test",
        )
        self.client.force_authenticate(user=self.user)

        # Create an inventory and assign the user as an owner/member
        self.inventory = Inventory.objects.create(name="Main Warehouse")
        InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.user,
            role="OWNER",
        )

        self.custom_fields_url = (
            f"/api/inventory/inventories/{self.inventory.id}/custom-fields/"
        )
        self.items_url = "/api/inventory/items/"
        self.inventory_items_url = (
            f"/api/inventory/inventories/{self.inventory.id}/items/"
        )

    def test_create_custom_field_success(self):
        payload = {"name": "Aisle Number", "data_type": "text"}
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assert_contract(
            response, CREATE_CUSTOM_FIELD_CONTRACT, status.HTTP_201_CREATED
        )
        self.assertEqual(InventoryCustomField.objects.count(), 1)

        field = InventoryCustomField.objects.get()
        self.assertEqual(field.name, "Aisle Number")
        self.assertEqual(field.data_type, "text")
        self.assertEqual(field.inventory, self.inventory)

    def test_create_custom_field_prevents_hardcoded_collision(self):
        payload = {"name": "quantity", "data_type": "number"}
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assert_contract(
            response, CREATE_CUSTOM_FIELD_CONTRACT, status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(InventoryCustomField.objects.count(), 0)
        self.assertIn("already exists", str(response.data).lower())

    def test_create_item_with_custom_field_values(self):
        custom_field = InventoryCustomField.objects.create(
            inventory=self.inventory, name="ISBN", data_type="text"
        )

        payload = {
            "inventory": self.inventory.id,
            "name": "Moby Dick",
            "quantity": 5,
            "custom_fields": {str(custom_field.id): "978-0142437247"},
        }

        response = self.client.post(self.items_url, payload, format="json")

        self.assert_contract(
            response, CREATE_ITEM_CONTRACT, status.HTTP_201_CREATED
        )
        self.assertEqual(InventoryItem.objects.count(), 1)

        # Check the JSONField directly
        saved_item = InventoryItem.objects.get()
        self.assertEqual(
            saved_item.custom_fields, {str(custom_field.id): "978-0142437247"}
        )

    def test_create_item_with_invalid_custom_field_id(self):
        payload = {
            "inventory": self.inventory.id,
            "name": "Invalid Item",
            "quantity": 1,
            "custom_fields": {"9999": "Some Value"},
        }

        response = self.client.post(self.items_url, payload, format="json")

        self.assert_contract(
            response, CREATE_ITEM_CONTRACT, status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(InventoryItem.objects.count(), 0)
        self.assertIn("does not exist", str(response.data).lower())

    def test_list_items_serializes_custom_fields(self):
        custom_field = InventoryCustomField.objects.create(
            inventory=self.inventory, name="Color", data_type="text"
        )

        # Populate the JSON field directly on creation
        InventoryItem.objects.create(
            inventory=self.inventory,
            name="T-Shirt",
            quantity=10,
            custom_fields={str(custom_field.id): "Blue"},
        )

        response = self.client.get(self.inventory_items_url)

        self.assert_contract(response, LIST_ITEMS_CONTRACT, status.HTTP_200_OK)

        data = response.data
        results = (
            data.get("results", data)
            if isinstance(data, dict) and "results" in data
            else data
        )

        assert isinstance(results, list)
        self.assertEqual(len(results), 1)
        item_data = results[0]

        self.assertIn("custom_fields", item_data)

        self.assertEqual(
            item_data["custom_fields"][str(custom_field.id)], "Blue"
        )
