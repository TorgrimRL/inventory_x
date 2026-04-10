import uuid

from django.test import TestCase
from django.urls import reverse
from rest_framework import status

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.contracts.adjust_stock import ADJUST_STOCK_RESPONSES
from api.inventory.contracts.update_item import UPDATE_ITEM_RESPONSES
from api.inventory.models import (
    Inventory,
    InventoryItem,
    InventoryMembership,
    ItemCategory,
)
from api.inventory.services.items import adjust_stock, get_all_items
from api.tests.base import BaseAPITestCase


class InventoryItemsTests(TestCase):
    def setUp(self):
        org = str(uuid.uuid4().int)[:9]
        self.inventory = Inventory.objects.create(
            name="Test Inventory",
            org_number=org,
        )

        self.item_1 = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Mouse",
            price=50,
            stock=10,
        )
        self.item_2 = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Keyboard",
            price=100,
            stock=5,
        )

    def test_get_all_items_returns_correct_data(self):
        results = get_all_items(inventory_id=self.inventory.id)

        # Assert total length
        self.assertEqual(len(results), 2)

        # Convert list to a dictionary
        results_by_name = {item["name"]: item for item in results}

        self.assertIn("Mouse", results_by_name)
        self.assertIn("Keyboard", results_by_name)

        self.assertEqual(results_by_name["Mouse"]["price"], 50)
        self.assertEqual(results_by_name["Keyboard"]["price"], 100)

    def test_adjust_stock_increase(self):
        updated_item = adjust_stock(
            inventory_id=self.inventory.id,
            item_id=self.item_1.id,
            direction="increase",
            amount=5,
        )
        self.assertEqual(updated_item.stock, 15)

    def test_adjust_stock_decrease(self):
        updated_item = adjust_stock(
            inventory_id=self.inventory.id,
            item_id=self.item_2.id,
            direction="decrease",
            amount=4,
        )
        self.assertEqual(updated_item.stock, 1)

    def test_adjust_stock_invalid_amount(self):
        with self.assertRaises(ValueError):
            adjust_stock(
                inventory_id=self.inventory.id,
                item_id=self.item_1.id,
                direction="increase",
                amount=0,
            )

    def test_adjust_stock_item_does_not_exist(self):
        with self.assertRaises(LookupError):
            adjust_stock(
                inventory_id=self.inventory.id,
                item_id=uuid.uuid4(),
                direction="increase",
                amount=1,
            )

    def test_adjust_stock_rejects_negative_and_does_not_change_db(self):
        with self.assertRaises(ValueError) as ctx:
            adjust_stock(
                inventory_id=self.inventory.id,
                item_id=self.item_2.id,
                direction="decrease",
                amount=999,
            )

        self.assertEqual(str(ctx.exception), "Stock cannot be negative")

        self.item_2.refresh_from_db()
        self.assertEqual(self.item_2.stock, 5)


class AdjustStockViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="user@test.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

        # Create an inventory + membership and set it active in session
        self.inventory = Inventory.objects.create(
            name="Ola AS", org_number="123456789"
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        # Make the session select active inventory
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        self.item = InventoryItem.objects.create(
            inventory=self.inventory,
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
            status.HTTP_403_FORBIDDEN,
        )

    def test_item_not_found_returns_404(self):
        non_existent_item_id = uuid.uuid4()

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

    def test_cannot_adjust_item_outside_active_inventory_returns_404(self):
        # Arrange
        other_inv = Inventory.objects.create(
            name="Other Co",
            org_number="999888777",
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=other_inv,
            role=InventoryMembership.Role.OWNER,
        )

        other_item = InventoryItem.objects.create(
            inventory=other_inv,
            name="Other Milk",
            price=10,
            stock=10,
        )

        # Act
        url = reverse("adjust-stock", args=[other_item.id])
        res = self.client.post(
            url,
            {"direction": "increase", "amount": 1},
            format="json",
        )

        # Assert
        self.assert_contract(
            res, ADJUST_STOCK_RESPONSES, status.HTTP_404_NOT_FOUND
        )


class UpdateItemViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="user@test.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

        self.inventory = Inventory.objects.create(
            name="Ola AS", org_number="123456789"
        )

        self.membership = InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        self.item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Milk",
            price=25,
            stock=10,
        )

        self.url = reverse(
            "item-detail",
            args=[self.item.id],
        )

    def test_update_item_success(self):
        response = self.client.patch(
            self.url,
            {"name": "Skim Milk", "price": 30, "low_stock_notification": False},
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
        non_existent_item_id = uuid.uuid4()
        url = reverse("item-detail", args=[non_existent_item_id])

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
        self.membership.role = InventoryMembership.Role.EMPLOYEE
        self.membership.save()

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

    def test_update_item_add_single_category(self):
        category = ItemCategory.objects.create(
            inventory=self.inventory, name="Dairy"
        )

        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": 25, "category_ids": [str(category.id)]},
            format="json",
        )

        data = self.assert_contract(
            response, UPDATE_ITEM_RESPONSES, status.HTTP_200_OK
        )
        self.assertIn(
            str(category.id), [str(cat_id) for cat_id in data["category_ids"]]
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.categories.count(), 1)

    def test_update_item_add_multiple_categories(self):
        cat1 = ItemCategory.objects.create(
            inventory=self.inventory, name="Dairy"
        )
        cat2 = ItemCategory.objects.create(
            inventory=self.inventory, name="Cold"
        )

        response = self.client.patch(
            self.url,
            {
                "name": "Milk",
                "price": 25,
                "category_ids": [str(cat1.id), str(cat2.id)],
            },
            format="json",
        )

        self.assert_contract(
            response, UPDATE_ITEM_RESPONSES, status.HTTP_200_OK
        )
        self.item.refresh_from_db()
        self.assertEqual(self.item.categories.count(), 2)

    def test_update_item_remove_all_categories(self):
        cat1 = ItemCategory.objects.create(
            inventory=self.inventory, name="Dairy"
        )
        cat2 = ItemCategory.objects.create(
            inventory=self.inventory, name="Cold"
        )
        self.item.categories.set([cat1, cat2])

        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": 25, "category_ids": []},
            format="json",
        )

        data = self.assert_contract(
            response, UPDATE_ITEM_RESPONSES, status.HTTP_200_OK
        )
        self.assertEqual(len(data["category_ids"]), 0)

        self.item.refresh_from_db()
        self.assertEqual(self.item.categories.count(), 0)

    def test_update_item_partial_remove_categories(self):
        cat1 = ItemCategory.objects.create(
            inventory=self.inventory, name="Dairy"
        )
        cat2 = ItemCategory.objects.create(
            inventory=self.inventory, name="Cold"
        )
        self.item.categories.set([cat1, cat2])

        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": 25, "category_ids": [str(cat1.id)]},
            format="json",
        )

        self.assert_contract(
            response, UPDATE_ITEM_RESPONSES, status.HTTP_200_OK
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.categories.count(), 1)
        self.assertEqual(self.item.categories.all()[0].id, cat1.id)

        first_category = self.item.categories.first()
        assert first_category is not None
        self.assertEqual(first_category.id, cat1.id)

    def test_update_item_with_non_existent_category_returns_400(self):
        response = self.client.patch(
            self.url,
            {"name": "Milk", "price": 25, "category_ids": [str(uuid.uuid4())]},
            format="json",
        )

        self.assert_contract(
            response, UPDATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

        self.item.refresh_from_db()
        self.assertEqual(self.item.categories.count(), 0)

    def test_update_item_with_category_from_other_inventory_returns_400(self):
        other_inv = Inventory.objects.create(
            name="Other Inv", org_number="222222222"
        )
        other_category = ItemCategory.objects.create(
            inventory=other_inv, name="Other Cat"
        )

        response = self.client.patch(
            self.url,
            {
                "name": "Milk",
                "price": 25,
                "category_ids": [str(other_category.id)],
            },
            format="json",
        )

        self.assert_contract(
            response, UPDATE_ITEM_RESPONSES, status.HTTP_400_BAD_REQUEST
        )
