from django.contrib.auth import get_user_model
from rest_framework import status

from api.inventory.contracts.create_item import CREATE_ITEM_RESPONSES
from api.inventory.contracts.custom_field import (
    CREATE_CUSTOM_FIELD_RESPONSES,
    DELETE_CUSTOM_FIELD_RESPONSES,
    GET_CUSTOM_FIELDS_RESPONSES,
)
from api.inventory.contracts.list_items import LIST_ITEMS_RESPONSES
from api.inventory.models import (
    Inventory,
    InventoryCustomField,
    InventoryItem,
    InventoryMembership,
)
from api.tests.base import BaseAPITestCase

User = get_user_model()


class InventoryCustomFieldsTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="owner@example.com",
            password="testpassword123",
            display_name="Test",
        )
        self.client.force_authenticate(user=self.user)

        # Create an inventory and assign the user as an owner
        self.inventory = Inventory.objects.create(
            name="Main Warehouse", org_number="123456789"
        )
        InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.user,
            role=InventoryMembership.Role.OWNER,
        )

        # Inject the active inventory into the test client's session
        session = self.client.session
        session["active_inventory_id"] = str(self.inventory.id)
        session.save()

        self.custom_fields_url = "/api/inventory/active/fields/"
        self.items_url = "/api/inventory/"

    def item_detail_url(self, item_id):
        return f"/api/inventory/{item_id}/"

    def test_list_custom_fields_success(self):
        InventoryCustomField.objects.create(
            inventory=self.inventory, name="Aisle", data_type="text"
        )

        # Create a field in another inventory to test isolation
        other_inv = Inventory.objects.create(name="Other")
        InventoryCustomField.objects.create(
            inventory=other_inv, name="Secret Field", data_type="text"
        )

        response = self.client.get(self.custom_fields_url)

        self.assert_contract(
            response, GET_CUSTOM_FIELDS_RESPONSES, status.HTTP_200_OK
        )
        # Should only see fields belonging to 'Main Warehouse'
        assert isinstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Aisle")

    def test_create_custom_field_success(self):
        payload = {"name": "Aisle Number", "data_type": "text"}
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assert_contract(
            response, CREATE_CUSTOM_FIELD_RESPONSES, status.HTTP_201_CREATED
        )
        self.assertEqual(InventoryCustomField.objects.count(), 1)
        assert isinstance(response.data, dict)
        self.assertEqual(response.data["name"], "Aisle Number")

    def test_create_custom_field_permission_denied_for_employee(self):
        """Verify that only Owners can manage the inventory schema."""
        membership = InventoryMembership.objects.get(
            user=self.user, inventory=self.inventory
        )
        membership.role = InventoryMembership.Role.EMPLOYEE
        membership.save()

        payload = {"name": "Unauthorized Field", "data_type": "text"}
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_custom_field_prevents_hardcoded_collision(self):
        payload = {"name": "stock", "data_type": "number"}
        response = self.client.post(
            self.custom_fields_url, payload, format="json"
        )

        self.assert_contract(
            response, CREATE_CUSTOM_FIELD_RESPONSES, status.HTTP_400_BAD_REQUEST
        )
        assert isinstance(response.data, dict)
        self.assertIn("already exists", str(response.data["detail"]["name"]))

    def test_delete_custom_field_success(self):
        field = InventoryCustomField.objects.create(
            inventory=self.inventory, name="To Delete", data_type="text"
        )

        response = self.client.delete(f"{self.custom_fields_url}{field.id}/")

        self.assert_contract(
            response, DELETE_CUSTOM_FIELD_RESPONSES, status.HTTP_204_NO_CONTENT
        )
        self.assertEqual(InventoryCustomField.objects.count(), 0)

    def test_create_item_with_custom_field_values(self):
        custom_field = InventoryCustomField.objects.create(
            inventory=self.inventory, name="ISBN", data_type="text"
        )

        payload = {
            "name": "Moby Dick",
            "price": 15,
            "stock": 5,
            "custom_fields": {str(custom_field.id): "978-0142437247"},
        }

        response = self.client.post(self.items_url, payload, format="json")

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_201_CREATED
        )

        saved_item = InventoryItem.objects.get(name="Moby Dick")
        self.assertEqual(
            saved_item.custom_fields, {str(custom_field.id): "978-0142437247"}
        )

    def test_create_item_with_invalid_custom_field_id(self):
        payload = {
            "name": "Invalid Item",
            "price": 10,
            "stock": 1,
            "custom_fields": {"00000000-0000-0000-0000-000000000000": "Value"},
        }

        response = self.client.post(self.items_url, payload, format="json")

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )
        self.assertIn("does not exist", str(response.data).lower())

    def test_create_item_with_field_from_other_inventory(self):
        other_inv = Inventory.objects.create(
            name="Other", org_number="098765432"
        )
        other_field = InventoryCustomField.objects.create(
            inventory=other_inv, name="Other Field", data_type="text"
        )

        payload = {
            "name": "Exploit Item",
            "price": 10,
            "custom_fields": {str(other_field.id): "Injected Value"},
        }

        response = self.client.post(self.items_url, payload, format="json")

        # IDs must exist globally AND belong to the active inventory context
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "does not exist for this inventory", str(response.data).lower()
        )

    def test_list_items_serializes_custom_fields(self):
        custom_field = InventoryCustomField.objects.create(
            inventory=self.inventory, name="Color", data_type="text"
        )

        InventoryItem.objects.create(
            inventory=self.inventory,
            name="T-Shirt",
            price=20,
            stock=10,
            custom_fields={str(custom_field.id): "Blue"},
        )

        response = self.client.get(self.items_url)

        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)

        assert isinstance(response.data, dict)
        results = response.data.get("data", [])
        self.assertEqual(len(results), 1)
        self.assertEqual(
            results[0]["custom_fields"][str(custom_field.id)], "Blue"
        )

    def test_update_item_merges_custom_fields(self):
        cf1 = InventoryCustomField.objects.create(
            inventory=self.inventory, name="A", data_type="text"
        )
        cf2 = InventoryCustomField.objects.create(
            inventory=self.inventory, name="B", data_type="text"
        )

        item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Base Item",
            price=10,
            custom_fields={str(cf1.id): "Initial"},
        )

        payload = {"custom_fields": {str(cf2.id): "New"}}
        response = self.client.patch(
            self.item_detail_url(item.id), payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        item.refresh_from_db()
        # Both fields should exist now
        self.assertEqual(item.custom_fields[str(cf1.id)], "Initial")
        self.assertEqual(item.custom_fields[str(cf2.id)], "New")

    def test_update_item_with_invalid_custom_field_id(self):
        item = InventoryItem.objects.create(
            inventory=self.inventory, name="Patch Test", price=1
        )
        payload = {
            "custom_fields": {"00000000-0000-0000-0000-000000000000": "Invalid"}
        }

        response = self.client.patch(
            self.item_detail_url(item.id), payload, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("does not exist", str(response.data).lower())
