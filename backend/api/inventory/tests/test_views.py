from django.urls import reverse
from rest_framework import status

from api.inventory.contracts import (
    ADJUST_STOCK_RESPONSES,
    CREATE_ITEM_RESPONSES,
    LIST_INVENTORIES_RESPONSES,
    LIST_ITEMS_RESPONSES,
    UPDATE_ITEM_RESPONSES,
)
from api.inventory.models import Inventory, InventoryItem, InventoryMembership
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


class UpdateItemViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="user@test.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

        self.item = InventoryItem.objects.create(
            name="Milk",
            price=25,
            stock=10,
        )

        self.url = reverse(
            "update-item",
            args=[self.item.id],
        )

        self._owner_ready = False

    def make_owner(self):
        if self._owner_ready:
            return

        inv = Inventory.objects.create(name="Test AS", org_number="123123123")
        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv,
            role=InventoryMembership.Role.OWNER,
        )

        self._owner_ready = True

    def test_update_item_success(self):
        self.make_owner()

        response = self.client.patch(
            self.url,
            {"name": "Skim Milk", "price": 30},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_200_OK,
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.name, "Skim Milk")
        self.assertEqual(self.item.price, 30)
        self.assertEqual(self.item.stock, 10)

    def test_update_item_blank_name_returns_400(self):
        self.make_owner()

        response = self.client.patch(
            self.url,
            {"name": "", "price": 30},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_400_BAD_REQUEST,
        )

    def test_update_item_negative_price_returns_400(self):
        self.make_owner()

        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": -5},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_400_BAD_REQUEST,
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.price, 25)

    def test_update_item_non_numeric_price_returns_400(self):
        self.make_owner()

        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": "abc"},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_400_BAD_REQUEST,
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.price, 25)

    def test_update_item_not_found_returns_404(self):
        self.make_owner()

        url = reverse("update-item", args=[9999])

        response = self.client.patch(
            url,
            {"name": "Milk", "price": 30},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_404_NOT_FOUND,
        )

    def test_requires_authentication(self):
        self.client.logout()

        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": 30},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

    def test_only_owner_can_update_name_and_price(self):
        inv = Inventory.objects.create(name="Test AS", org_number="123123123")
        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv,
            role=InventoryMembership.Role.EMPLOYEE,
        )

        response = self.client.patch(
            self.url,
            {"name": "Skim Milk", "price": 30},
            format="json",
        )

        self.assert_contract(
            response,
            UPDATE_ITEM_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.name, "Milk")
        self.assertEqual(self.item.price, 25)
        self.assertEqual(self.item.stock, 10)


class ListInventoriesViewTests(BaseAPITestCase):
    def setUp(self):
        self.url = reverse("inventories-list")
        self.user = self.create_user(
            email="user@test.com", password="password123"
        )
        self.other_user = self.create_user(
            email="other@test.com", password="password123"
        )

    def test_requires_authentication(self):
        response = self.client.get(self.url)

        # Med BasicAuthentication i DEFAULT_AUTHENTICATION_CLASSES
        # pleier GET uten creds å bli 401.
        self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_403_FORBIDDEN,
        )

    def test_happy_path_lists_two_inventories_with_role_and_orders_by_name(
        self,
    ):
        self.client.force_authenticate(user=self.user)
        inv_b = Inventory.objects.create(name="Beta AS", org_number="987654321")
        inv_a = Inventory.objects.create(name="Acme AS", org_number="123456789")

        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv_a,
            role=InventoryMembership.Role.OWNER,
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=inv_b,
            role=InventoryMembership.Role.EMPLOYEE,
        )

        response = self.client.get(self.url)
        self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_200_OK,
        )

        body = response.json()
        self.assertIsInstance(body, list)
        self.assertEqual(len(body), 2)

        for row in body:
            self.assertIn("id", row)
            self.assertIn("name", row)
            self.assertIn("orgNumber", row)
            self.assertIn("role", row)

        self.assertEqual(body[0]["name"], "Acme AS")
        self.assertEqual(body[0]["orgNumber"], "123456789")
        self.assertEqual(body[0]["role"], "owner")

        self.assertEqual(body[1]["name"], "Beta AS")
        self.assertEqual(body[1]["orgNumber"], "987654321")
        self.assertEqual(body[1]["role"], "employee")

    def test_empty_state_returns_empty_list(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get(self.url)
        data = self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_200_OK,
        )

        self.assertEqual(data, [])

    def test_user_cannot_see_other_users_inventories(self):
        self.client.force_authenticate(user=self.user)

        inv_other = Inventory.objects.create(
            name="Other Co", org_number="111222333"
        )
        InventoryMembership.objects.create(
            user=self.other_user,
            inventory=inv_other,
            role=InventoryMembership.Role.OWNER,
        )

        response = self.client.get(self.url)
        data = self.assert_contract(
            response,
            LIST_INVENTORIES_RESPONSES,
            status.HTTP_200_OK,
        )

        self.assertEqual(data, [])
