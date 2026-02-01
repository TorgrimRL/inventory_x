from django.urls import reverse
from rest_framework import status

from api.inventory.contracts import ADJUST_STOCK_RESPONSES
from api.inventory.models import InventoryItem
from api.tests.base import BaseAPITestCase


class InventoryListViewTests(BaseAPITestCase):
    def test_inventory_list_view(self):
        # Setup
        InventoryItem.objects.create(name="Monitor", price=200, stock=1)

        # Execute
        response = self.client.get("/api/inventory/")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(data["data"][0]["name"], "Monitor")


class AdjustStockViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="user@test.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

        self.item = InventoryItem.objects.create(
            name="Milk",
            price=10,
            stock=10,
        )

        self.url = reverse(
            "adjust-stock",
            args=[self.item.id],
        )

    def test_increase_stock_success(self):
        response = self.client.post(
            self.url,
            {"direction": "increase", "amount": 5},
        )

        data = self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_200_OK,
        )

        self.assertEqual(data["stock"], 15)
        self.assertEqual(data["item_id"], self.item.id)

    def test_decrease_stock_success(self):
        response = self.client.post(
            self.url,
            {"direction": "decrease", "amount": 3},
        )

        data = self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_200_OK,
        )

        self.assertEqual(data["stock"], 7)

    def test_invalid_amount_returns_400(self):
        response = self.client.post(
            self.url,
            {"direction": "increase", "amount": 0},
        )

        self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_requires_authentication(self):
        self.client.logout()

        response = self.client.post(
            self.url,
            {"direction": "increase", "amount": 5},
        )

        self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_401_UNAUTHORIZED,
        )
