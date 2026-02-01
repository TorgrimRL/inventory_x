from api.inventory.models import InventoryItem
from api.inventory.services import adjust_stock, get_all_items
from api.tests.base import BaseAPITestCase


class InventoryServicesTests(BaseAPITestCase):
    def test_get_all_items_returns_correct_data(self):
        # Setup
        InventoryItem.objects.create(name="Mouse", price=50, stock=10)
        InventoryItem.objects.create(name="Keyboard", price=100, stock=5)

        # Execute
        results = get_all_items()

        # Assert
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Mouse")
        self.assertEqual(results[1]["price"], 100)

    def test_adjust_stock_increase(self):
        item = InventoryItem.objects.create(name="Milk", price=20, stock=10)
        updated_item = adjust_stock(
            item_id=item.id, direction="increase", amount=5
        )
        self.assertEqual(updated_item.stock, 15)

    def test_adjust_stock_decrease(self):
        item = InventoryItem.objects.create(name="Bread", price=30, stock=10)
        updated_item = adjust_stock(
            item_id=item.id, direction="decrease", amount=4
        )
        self.assertEqual(updated_item.stock, 6)

    def test_adjust_stock_invalid_amount(self):
        item = InventoryItem.objects.create(name="Milk", price=10, stock=10)

        with self.assertRaises(ValueError):
            adjust_stock(item_id=item.id, direction="increase", amount=0)

    def test_adjust_stock_item_does_not_exist(self):
        with self.assertRaises(LookupError):
            adjust_stock(
                item_id=9999,
                direction="increase",
                amount=1,
            )
