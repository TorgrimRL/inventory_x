from django.urls import reverse
from rest_framework import status

from api.inventory.contracts.active_inventory import (
    GET_ACTIVE_INVENTORY_RESPONSES,
    SET_ACTIVE_INVENTORY_RESPONSES,
)
from api.inventory.models import Inventory, InventoryMembership
from api.tests.base import BaseAPITestCase


class ActiveInventoryViewTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()

        # Arrange (common setup)
        self.url = reverse("inventory-active")

        self.user = self.create_user(
            email="user@test.com",
            password="password123",
        )
        self.other = self.create_user(
            email="other@test.com",
            password="password123",
        )

        self.inv1 = Inventory.objects.create(
            name="Acme AS",
            org_number="123456789",
        )
        self.inv2 = Inventory.objects.create(
            name="Beta AS",
            org_number="987654321",
        )

        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inv1,
            role=InventoryMembership.Role.OWNER,
        )
        InventoryMembership.objects.create(
            user=self.other,
            inventory=self.inv2,
            role=InventoryMembership.Role.OWNER,
        )

    def test_get_returns_204_when_no_active_selected(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        response = self.client.get(self.url)

        # Assert
        self.assert_contract(
            response,
            GET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_204_NO_CONTENT,
        )

    def test_post_sets_active_and_get_returns_active(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act (set active)
        res_set = self.client.post(
            self.url,
            {"inventory_id": str(self.inv1.id)},
            format="json",
        )

        # Assert (set response)
        self.assert_contract(
            res_set,
            SET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_200_OK,
        )
        body = res_set.json()
        self.assertEqual(body["id"], str(self.inv1.id))
        self.assertEqual(body["name"], "Acme AS")
        self.assertEqual(body["orgNumber"], "123456789")
        self.assertEqual(body["role"], "owner")

        # Act (get active)
        res_get = self.client.get(self.url)

        # Assert (get response)
        self.assert_contract(
            res_get,
            GET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_200_OK,
        )
        body2 = res_get.json()
        self.assertEqual(body2["id"], str(self.inv1.id))
        self.assertEqual(body2["name"], "Acme AS")

    def test_post_rejects_inventory_user_is_not_member_of(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        res = self.client.post(
            self.url,
            {"inventory_id": str(self.inv2.id)},
            format="json",
        )

        # Assert
        self.assert_contract(
            res,
            SET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

    def test_post_invalid_payload_returns_400(self):
        # Arrange
        self.client.force_authenticate(user=self.user)

        # Act
        res = self.client.post(self.url, {}, format="json")

        # Assert
        self.assert_contract(
            res,
            SET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_requires_authentication(self):
        # Arrange
        # (no authentication)

        # Act (GET)
        res_get = self.client.get(self.url)

        # Assert (GET)
        self.assert_contract(
            res_get,
            GET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

        # Act (POST)
        res_post = self.client.post(
            self.url,
            {"inventory_id": str(self.inv1.id)},
            format="json",
        )

        # Assert (POST)
        self.assert_contract(
            res_post,
            SET_ACTIVE_INVENTORY_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )
