from django.urls import reverse
from rest_framework import status

from api.inventory.contracts import (
    ADJUST_STOCK_RESPONSES,
    CREATE_ITEM_RESPONSES,
    LIST_ITEMS_RESPONSES,
)
from api.inventory.models import InventoryItem
from api.tests.base import BaseAPITestCase


class InventoryListViewTests(BaseAPITestCase):
    def test_inventory_list_view(self):
        InventoryItem.objects.create(name="Monitor", price=200, stock=1)

        response = self.client.get("/api/inventory/")
        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(data["data"][0]["name"], "Monitor")

    def test_inventory_list_multiple_items(self):
        InventoryItem.objects.create(name="Monitor", price=200, stock=1)
        InventoryItem.objects.create(name="Keyboard", price=100, stock=5)

        response = self.client.get("/api/inventory/")

        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(len(data["data"]), 2)
        self.assertEqual(data["data"][0]["name"], "Monitor")
        self.assertEqual(data["data"][1]["name"], "Keyboard")

    def test_inventory_list_empty(self):
        response = self.client.get("/api/inventory/")

        self.assert_contract(response, LIST_ITEMS_RESPONSES, status.HTTP_200_OK)
        data = response.json()

        self.assertIn("data", data)
        self.assertEqual(data["data"], [])

    def test_inventory_item_empty_name(self):
        response = self.client.post(
            "/api/inventory/",
            {"name": "", "price": 100, "stock": 5},
            format="json",
        )

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        data = response.json()
        # Ikke anta eksakt format.
        # Vi sjekker bare at feilen gjelder "name".
        self.assertTrue(
            ("name" in data)
            or ("detail" in data and "name" in str(data["detail"]).lower())
        )

    def test_inventory_item_created(self):
        payload = {"name": "Test Item", "price": 100, "stock": 5}

        response = self.client.post("/api/inventory/", payload, format="json")

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_201_CREATED
        )
        data = response.json()

        self.assertTrue(
            ("name" in data)
            or (
                "data" in data
                and isinstance(data["data"], dict)
                and "name" in data["data"]
            )
            or ("id" in data)
            or (
                "data" in data
                and isinstance(data["data"], dict)
                and "id" in data["data"]
            )
            or ("detail" in data and "name" in str(data["detail"]).lower())
        )

    def test_inventory_item_negative_stock(self):
        response = self.client.post(
            "/api/inventory/",
            {"name": "Test Item", "price": 100, "stock": -5},
            format="json",
        )

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        data = response.json()
        self.assertTrue(
            ("stock" in data)
            or ("detail" in data and "stock" in str(data["detail"]).lower())
        )

    def test_inventory_item_negative_price(self):
        response = self.client.post(
            "/api/inventory/",
            {"name": "Test Item", "price": -5, "stock": 5},
            format="json",
        )

        self.assert_contract(
            response, CREATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        data = response.json()
        self.assertTrue(
            ("price" in data)
            or ("detail" in data and "price" in str(data["detail"]).lower())
        )


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
            format="json",
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
            format="json",
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
            format="json",
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
            format="json",
        )

        self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_item_not_found_returns_404(self):
        non_existent_item_id = self.item.id + 999

        url = reverse(
            "adjust-stock",
            args=[non_existent_item_id],
        )

        response = self.client.post(
            url,
            {"direction": "increase", "amount": 5},
            format="json",
        )

        self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_404_NOT_FOUND,
        )

    def test_decrease_stock_below_zero_returns_400_and_stock_unchanged(self):
        response = self.client.post(
            self.url,
            {"direction": "decrease", "amount": 999},
        )

        self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_400_BAD_REQUEST,
        )

        body = response.json()
        self.assertEqual(
            body["detail"]["non_field_errors"][0],
            "Stock cannot be negative",
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.stock, 10)
