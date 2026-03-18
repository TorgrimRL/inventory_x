import uuid
from typing import Any, cast

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.contracts.stock_log import STOCK_LOG_RESPONSES
from api.inventory.models import (
    Inventory,
    InventoryItem,
    InventoryMembership,
    StockLog,
)
from api.inventory.services.items import adjust_stock, create_item, update_item
from api.tests.base import BaseAPITestCase

User = get_user_model()


class MockRequest:
    """A simple mock request to pass to our services to test user logging."""

    def __init__(self, user):
        self.user = user


class StockLogTests(TestCase):
    def setUp(self):
        org = str(uuid.uuid4().int)[:9]
        self.inventory = Inventory.objects.create(
            name="Test Inventory",
            org_number=org,
        )

        # Create a dummy user to test the decorator's user extraction
        self.user = User.objects.create_user(  # type: ignore[call-arg]
            email="admin@test.com",
            password="password123",
            display_name="Test Admin",
        )
        self.mock_request = MockRequest(self.user)

    def test_create_item_ok(self):
        # Act
        create_item(
            inventory_id=self.inventory.id,
            name="New Laptop",
            price=15000,
            stock=10,
            request=self.mock_request,
        )
        self.assertEqual(StockLog.objects.count(), 1)
        log = StockLog.objects.first()
        assert log is not None

        self.assertEqual(log.action, "create_item")
        self.assertEqual(log.item_name, "New Laptop")
        self.assertEqual(log.price, 15000)
        self.assertEqual(log.current_stock, 10)
        self.assertEqual(log.performed_by, self.user)
        self.assertEqual(log.performed_by_name, "Test Admin")

    def test_update_item_ok(self):
        # Arrange: Create an item first (this creates log #1)
        item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Old Mouse",
            price=100,
            stock=5,
            low_stock_threshold=5,
        )

        # Act: Update the item (this creates log #2)
        update_item(
            item_id=item.id,
            name="Gaming Mouse",
            price=500,
            low_stock_threshold=10,
            request=self.mock_request,
        )

        log = StockLog.objects.first()
        assert log is not None

        self.assertEqual(log.action, "update_item")
        self.assertEqual(log.item_name, "Gaming Mouse")
        self.assertEqual(log.price, 500)
        self.assertEqual(log.current_stock, 5)  # Stock shouldn't change
        self.assertEqual(log.item_id, item.id)

    def test_adjust_item_ok(self):
        # Arrange: Create an item first
        item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Keyboard",
            price=1000,
            stock=20,
            low_stock_threshold=5,
        )

        # Act: Adjust stock downwards
        adjust_stock(
            inventory_id=self.inventory.id,
            item_id=item.id,
            direction="decrease",
            amount=5,
            request=self.mock_request,
        )

        log = StockLog.objects.first()
        assert log is not None

        self.assertEqual(log.action, "adjust_stock")
        self.assertEqual(log.direction, "decrease")
        self.assertEqual(log.amount, 5)
        self.assertEqual(log.current_stock, 15)  # 20 - 5 = 15
        self.assertEqual(log.item_name, "Keyboard")
        self.assertEqual(log.price, 1000)


class StockLogViewTests(BaseAPITestCase):
    def setUp(self):
        # 1. Create and authenticate user
        self.user = self.create_user(
            email="logger@test.com",
            password="password123",
            display_name="Logging Admin",
        )
        self.client.force_authenticate(self.user)

        # 2. Create inventory and membership
        self.inventory = Inventory.objects.create(
            name="Log Co", org_number="112233445"
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        # 4. Create an Item
        self.item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Milk",
            price=25,
            stock=10,
            low_stock_threshold=5,
        )

        # 5. Create a manual StockLog entry for testing the GET request
        self.log_entry = StockLog.objects.create(
            inventory_id=self.inventory.id,
            item_id=self.item.id,
            item_name="Milk",
            action="create_item",
            current_stock=10,
            price=25,
            performed_by=self.user,
            performed_by_name=self.user.display_name,
        )

        # Ensure this matches the `name="stock-log"` in your urls.py
        self.url = reverse("stock-log", args=[self.item.id])

    def test_get_stock_logs_200(self):
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()
        response = self.client.get(self.url)

        data = self.assert_contract(
            response,
            STOCK_LOG_RESPONSES,
            200,
        )

        data = cast(list[dict[str, Any]], data)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["action"], "create_item")
        self.assertEqual(data[0]["item_name"], "Milk")
        self.assertEqual(data[0]["current_stock"], 10)
        self.assertEqual(data[0]["price"], 25)
        self.assertEqual(data[0]["performed_by_name"], "Logging Admin")

    def test_get_stock_logs_403(self):
        self.client.logout()

        response = self.client.get(self.url)

        self.assert_contract(
            response,
            STOCK_LOG_RESPONSES,
            403,
        )

    def test_get_stock_logs_409(self):
        response = self.client.get(self.url)

        self.assert_contract(
            response,
            STOCK_LOG_RESPONSES,
            409,
        )
