from django.contrib.auth import get_user_model
from rest_framework import serializers, status

from api.inventory.models import (
    Inventory,
    InventoryCustomField,
    InventoryMember,
    Item,
    ItemCustomFieldValue,
)
from api.tests.base import BaseAPITestCase

User = get_user_model()


# --- TDD Placeholders for Contracts ---
class DummySerializer(serializers.Serializer):
    def to_internal_value(self, data):
        return data

    def to_representation(self, instance):
        return instance


CREATE_CUSTOM_FIELD_CONTRACT = {
    status.HTTP_201_CREATED: DummySerializer,
    status.HTTP_400_BAD_REQUEST: DummySerializer,
}
CREATE_ITEM_CONTRACT = {
    status.HTTP_201_CREATED: DummySerializer,
    status.HTTP_400_BAD_REQUEST: DummySerializer,
}
LIST_ITEMS_CONTRACT = {status.HTTP_200_OK: DummySerializer}
# --------------------------------------


class InventoryCustomFieldsTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="owner@example.com",
            password="testpassword123",
            first_name="Test",
            last_name="Owner",
        )
        self.client.force_authenticate(user=self.user)

        # Create an inventory and assign the user as an owner/member
        self.inventory = Inventory.objects.create(name="Main Warehouse")
        InventoryMember.objects.create(
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
        """
        Test that an inventory owner can create a new custom field.
        """
        payload = {"name": "Aisle Number", "data_type": "text"}
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assert_contract(
            response, CREATE_CUSTOM_FIELD_CONTRACT, status.HTTP_201_CREATED
        )
        self.assertEqual(InventoryCustomField.objects.count(), 1)

        field = InventoryCustomField.objects.first()
        self.assertEqual(field.name, "Aisle Number")
        self.assertEqual(field.data_type, "text")
        self.assertEqual(field.inventory, self.inventory)

    def test_create_custom_field_prevents_hardcoded_collision(self):
        """
        Test that creating a custom field with a reserved name
        (like 'quantity' or 'name') fails.
        """
        payload = {
            "name": "quantity",  # 'quantity' is a hard-coded standard field
            "data_type": "number",
        }
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assert_contract(
            response, CREATE_CUSTOM_FIELD_CONTRACT, status.HTTP_400_BAD_REQUEST
        )
        self.assertEqual(InventoryCustomField.objects.count(), 0)

        self.assertIn("already exists", str(response.data).lower())

    def test_create_item_with_custom_field_values(self):
        """
        Test that creating an item can simultaneously process and save custom
        field values.
        """
        # Setup an existing custom field
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
        self.assertEqual(ItemCustomFieldValue.objects.count(), 1)

        saved_value = ItemCustomFieldValue.objects.first()
        self.assertEqual(saved_value.custom_field, custom_field)
        self.assertEqual(saved_value.value, "978-0142437247")
        self.assertEqual(saved_value.item.name, "Moby Dick")

    def test_create_item_with_invalid_custom_field_id(self):
        """
        Test that the API rejects item creation if a provided custom field ID
        does not exist or belongs to a different inventory.
        """
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
        self.assertEqual(Item.objects.count(), 0)
        self.assertIn("does not exist", str(response.data).lower())

    def test_list_items_serializes_custom_fields(self):
        """
        Test that listing items returns their associated custom fields in the
        JSON response.
        """
        # Setup field, item, and value directly in DB
        custom_field = InventoryCustomField.objects.create(
            inventory=self.inventory, name="Color", data_type="text"
        )
        item = Item.objects.create(
            inventory=self.inventory, name="T-Shirt", quantity=10
        )
        ItemCustomFieldValue.objects.create(
            item=item, custom_field=custom_field, value="Blue"
        )

        # Fetch the items
        response = self.client.get(self.inventory_items_url)

        self.assert_contract(response, LIST_ITEMS_CONTRACT, status.HTTP_200_OK)

        # Assert the custom fields are serialized correctly
        data = response.data
        results = (
            data.get("results", data)
            if isinstance(data, dict) and "results" in data
            else data
        )

        self.assertEqual(len(results), 1)
        item_data = results[0]

        self.assertIn("custom_fields", item_data)

        custom_fields_data = item_data["custom_fields"]

        if isinstance(custom_fields_data, list):
            self.assertEqual(custom_fields_data[0]["value"], "Blue")
            self.assertEqual(custom_fields_data[0]["name"], "Color")
        else:
            self.assertEqual(custom_fields_data[str(custom_field.id)], "Blue")
