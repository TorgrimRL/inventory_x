from typing import Any

from django.urls import reverse
from rest_framework import status

from api.inventory.contracts import REGISTER_INVENTORY_RESPONSES
from api.inventory.models import Inventory, InventoryMembership
from api.tests.base import BaseAPITestCase


class RegisterInventoryTests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("inventory-register")
        self.user = self.create_user()
        self.valid_payload = {"name": "Ola AS", "orgNumber": "123456789"}

    def test_requires_authentication(self):
        # Arrange
        payload = self.valid_payload

        # Act
        response = self.client.post(self.url, payload, format="json")

        # Assert
        self.assertIn(
            response.status_code,
            (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN),
        )
        self.assert_contract(
            response,
            REGISTER_INVENTORY_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

    def test_happy_path_creates_inventory_and_owner_membership(
        self,
    ):
        # Arrange
        self.client.force_authenticate(user=self.user)
        payload = self.valid_payload

        # Act
        response = self.client.post(self.url, payload, format="json")
        data = self.assert_contract(
            response,
            REGISTER_INVENTORY_RESPONSES,
            status.HTTP_201_CREATED,
        )

        # Assert
        self.assertEqual(data["message"], "Inventory registered")
        inv_id = data["id"]

        self.assertTrue(
            Inventory.objects.filter(
                id=inv_id,
                name="Ola AS",
                org_number="123456789",
            ).exists()
        )
        self.assertTrue(
            InventoryMembership.objects.filter(
                user=self.user,
                inventory_id=inv_id,
                role=InventoryMembership.Role.OWNER,
            ).exists()
        )

    def test_missing_required_fields_returns_400_with_field_errors(
        self,
    ):
        # Arrange
        self.client.force_authenticate(user=self.user)

        scenarios: list[tuple[dict[str, Any], list[str]]] = [
            ({}, ["name", "orgNumber"]),
            ({"name": "", "orgNumber": ""}, ["name", "orgNumber"]),
            ({"name": "Ola AS"}, ["orgNumber"]),
            ({"orgNumber": "123456789"}, ["name"]),
        ]

        for payload, expected_keys in scenarios:
            with self.subTest(payload=payload):
                # Act
                response = self.client.post(self.url, payload, format="json")
                data = self.assert_contract(
                    response,
                    REGISTER_INVENTORY_RESPONSES,
                    status.HTTP_400_BAD_REQUEST,
                )

                # Assert
                errors = data.get("detail", {})
                for key in expected_keys:
                    self.assertIn(key, errors)

    def test_duplicate_org_number_returns_409(self):
        # Arrange
        Inventory.objects.create(name="Existing", org_number="123456789")
        self.client.force_authenticate(user=self.user)
        payload = {"name": "Another Company", "orgNumber": "123456789"}

        # Act
        response = self.client.post(self.url, payload, format="json")
        data = self.assert_contract(
            response,
            REGISTER_INVENTORY_RESPONSES,
            status.HTTP_409_CONFLICT,
        )

        # Assert
        self.assertFalse(
            Inventory.objects.filter(
                name="Another Company", org_number="123456789"
            ).exists()
        )
        errors = data.get("detail", {})
        self.assertIn("orgNumber", errors)
        self.assertTrue(errors["orgNumber"])
        self.assertIn(
            "Organization number is already registered", errors["orgNumber"]
        )

    def test_allows_registering_multiple_businesses(
        self,
    ):
        # Arrange
        self.client.force_authenticate(user=self.user)
        payload_1 = {"name": "Ola AS", "orgNumber": "123456789"}
        payload_2 = {"name": "Kari AS", "orgNumber": "987654321"}

        # Act
        res1 = self.client.post(self.url, payload_1, format="json")
        data1 = self.assert_contract(
            res1,
            REGISTER_INVENTORY_RESPONSES,
            status.HTTP_201_CREATED,
        )

        res2 = self.client.post(self.url, payload_2, format="json")
        data2 = self.assert_contract(
            res2,
            REGISTER_INVENTORY_RESPONSES,
            status.HTTP_201_CREATED,
        )

        # Assert
        self.assertNotEqual(data1["id"], data2["id"])

        self.assertTrue(
            InventoryMembership.objects.filter(
                user=self.user,
                inventory_id=data1["id"],
                role=InventoryMembership.Role.OWNER,
            ).exists()
        )
        self.assertTrue(
            InventoryMembership.objects.filter(
                user=self.user,
                inventory_id=data2["id"],
                role=InventoryMembership.Role.OWNER,
            ).exists()
        )
