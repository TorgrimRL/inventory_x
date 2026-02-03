from django.test import TestCase

from api.inventory.models import InventoryItem
from api.inventory.services import adjust_stock, get_all_items


class InventoryServicesTests(TestCase):
    def setUp(self):
        self.item_1 = InventoryItem.objects.create(
            name="Mouse", price=50, stock=10
        )
        self.item_2 = InventoryItem.objects.create(
            name="Keyboard", price=100, stock=5
        )

    def test_get_all_items_returns_correct_data(self):
        results = get_all_items()

        # Assert
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Mouse")
        self.assertEqual(results[1]["price"], 100)

    def test_adjust_stock_increase(self):
        updated_item = adjust_stock(
            item_id=self.item_1.id, direction="increase", amount=5
        )
        self.assertEqual(updated_item.stock, 15)

    def test_adjust_stock_decrease(self):
        updated_item = adjust_stock(
            item_id=self.item_2.id, direction="decrease", amount=4
        )
        self.assertEqual(updated_item.stock, 1)

    def test_adjust_stock_invalid_amount(self):
        with self.assertRaises(ValueError):
            adjust_stock(item_id=self.item_1.id, direction="increase", amount=0)

    def test_adjust_stock_item_does_not_exist(self):
        with self.assertRaises(LookupError):
            adjust_stock(
                item_id=9999,
                direction="increase",
                amount=1,
            )
