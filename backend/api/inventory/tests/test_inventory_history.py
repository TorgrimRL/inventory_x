from datetime import UTC, datetime

from django.urls import reverse

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.contracts.inventory_history import (
    INVENTORY_HISTORY_RESPONSES,
)
from api.inventory.models import (
    Inventory,
    InventoryItem,
    InventoryMembership,
    StockLog,
)
from api.tests.base import BaseAPITestCase


class InventoryHistoryViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="history@test.com",
            password="password123",
            display_name="History User",
        )
        self.client.force_authenticate(self.user)

        self.inventory = Inventory.objects.create(
            name="History Inventory", org_number="123456789"
        )
        self.other_inventory = Inventory.objects.create(
            name="Other Inventory", org_number="987654321"
        )

        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        self.item_a = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Item A",
            price=100,
            stock=5,
        )
        self.item_b = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Item B",
            price=200,
            stock=3,
        )
        self.other_item = InventoryItem.objects.create(
            inventory=self.other_inventory,
            name="Other Item",
            price=999,
            stock=1,
        )

        log = StockLog.objects.create(
            item=self.item_a,
            item_name=self.item_a.name,
            action="create_item",
            current_stock=10,
            price=100,
            performed_by=self.user,
        )
        StockLog.objects.filter(pk=log.pk).update(
            timestamp=datetime(2025, 12, 20, tzinfo=UTC)
        )

        log = StockLog.objects.create(
            item=self.item_b,
            item_name=self.item_b.name,
            action="create_item",
            current_stock=4,
            price=200,
            performed_by=self.user,
        )
        StockLog.objects.filter(pk=log.pk).update(
            timestamp=datetime(2025, 12, 22, tzinfo=UTC)
        )

        log = StockLog.objects.create(
            item=self.item_a,
            item_name=self.item_a.name,
            action="adjust_stock",
            current_stock=8,
            price=100,
            performed_by=self.user,
        )
        StockLog.objects.filter(pk=log.pk).update(
            timestamp=datetime(2026, 2, 15, tzinfo=UTC)
        )

        log = StockLog.objects.create(
            item=self.item_b,
            item_name=self.item_b.name,
            action="adjust_stock",
            current_stock=2,
            price=200,
            performed_by=self.user,
        )
        StockLog.objects.filter(pk=log.pk).update(
            timestamp=datetime(2026, 4, 10, tzinfo=UTC)
        )

        log = StockLog.objects.create(
            item=self.other_item,
            item_name=self.other_item.name,
            action="adjust_stock",
            current_stock=100,
            price=999,
            performed_by=self.user,
        )
        StockLog.objects.filter(pk=log.pk).update(
            timestamp=datetime(2026, 3, 1, tzinfo=UTC)
        )

        self.url = reverse("inventory-history")

    def test_returns_12_months_with_carry_forward_values(self):
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        response = self.client.get(self.url, {"year": 2026})
        data = self.assert_contract(
            response,
            INVENTORY_HISTORY_RESPONSES,
            200,
        )

        self.assertEqual(len(data), 12)
        self.assertEqual(data[0]["month"], "Jan")
        self.assertEqual(data[-1]["month"], "Dec")

        jan_value = 10 * 100 + 4 * 200
        feb_value = 8 * 100 + 4 * 200
        apr_value = 8 * 100 + 2 * 200

        self.assertEqual(data[0]["value"], jan_value)
        self.assertEqual(data[1]["value"], feb_value)
        self.assertEqual(data[2]["value"], feb_value)
        self.assertEqual(data[3]["value"], apr_value)
        self.assertEqual(data[11]["value"], apr_value)

    def test_excludes_other_inventory_logs(self):
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        response = self.client.get(self.url, {"year": 2026})
        data = self.assert_contract(
            response,
            INVENTORY_HISTORY_RESPONSES,
            200,
        )

        values = [point["value"] for point in data]
        self.assertTrue(all(value < 100000 for value in values))

    def test_requires_active_inventory(self):
        response = self.client.get(self.url, {"year": 2026})
        self.assert_contract(
            response,
            INVENTORY_HISTORY_RESPONSES,
            409,
        )
