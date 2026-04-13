import uuid

from django.core import mail

from api.inventory.models import Inventory, InventoryMembership
from api.inventory.services.items import adjust_stock, create_item, update_item
from api.tests.base import BaseAPITestCase


class LowStockNotificationTests(BaseAPITestCase):
    def setUp(self):
        # Create a user to perform the actions and receive the email
        self.user = self.create_user(
            email="manager@example.com",
            password="password123",
            display_name="Inventory Manager",
        )
        org = str(uuid.uuid4().int)[:9]
        self.inventory = Inventory.objects.create(
            name="Test Inventory",
            org_number=org,
        )
        self.inventory_id = self.inventory.id
        InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.user,
            role="owner",  # Matches the filter in decorator
        )
        self.item = create_item(
            inventory_id=self.inventory_id,
            name="Test Widget",
            price=100,
            stock=10,
            low_stock_threshold=5,
            low_stock_notification=True,
            user=self.user,
        )

        mail.outbox.clear()

    def test_adjust_stock_below_threshold(self):
        """
        Scenario: Item stock drops below the threshold via adjust_stock.
        Expectation: Email sent to the user with correct template variables.
        """

        # Action: Decrease stock by 6 < low_stock_threshold.
        adjust_stock(
            inventory_id=self.inventory_id,
            item_id=self.item["id"],
            direction="decrease",
            amount=6,
            user=self.user,
        )

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, ["manager@example.com"])

    def test_adjust_stock_above_threshold(self):
        """
        Scenario: Item stock decreases but remains ABOVE the threshold.
        Expectation: No email is sent.
        """

        # Action: Decrease stock by 2 > low_stock_threshold.
        adjust_stock(
            inventory_id=self.inventory_id,
            item_id=self.item["id"],
            direction="decrease",
            amount=2,
            user=self.user,
        )

        self.assertEqual(len(mail.outbox), 0)

    def test_update_item_notifications_disabled(
        self,
    ):
        """
        Scenario: Item stock drops below threshold, notifications are False.
        Expectation: No email is sent.
        """

        # Setup: Create an item with notifications disabled
        silent_item = create_item(
            inventory_id=self.inventory_id,
            name="Silent Widget",
            price=100,
            stock=10,
            low_stock_threshold=5,
            low_stock_notification=False,  # <-- Disabled
            user=self.user,
        )
        mail.outbox.clear()

        # Action: Decrease stock below threshold.
        update_item(
            inventory_id=self.inventory_id,
            name="silent_item",
            item_id=silent_item["id"],
            low_stock_threshold=5,
            low_stock_notification=False,
            price=100,
            user=self.user,
        )

        # Assert NO mail was sent
        self.assertEqual(len(mail.outbox), 0)

    def test_spam_notifications_protection(
        self,
    ):
        """
        Scenario: Item stockd double dips, notifications are enabled.
        Expectation: Two emails is sent.
        """

        # Setup: Create an item Enabled notifications.
        silent_item = create_item(
            inventory_id=self.inventory_id,
            name="Silent Widget",
            price=100,
            stock=10,
            low_stock_threshold=8,
            low_stock_notification=True,  # <-- Enabled
            user=self.user,
        )
        mail.outbox.clear()

        # Action: Doube dip stock around the threshold.
        for i, directionn in enumerate(["decrease", "increase", "decrease"]):
            for _ in range(3):
                adjust_stock(
                    inventory_id=self.inventory_id,
                    item_id=silent_item["id"],
                    direction=directionn,
                    amount=1,
                    user=self.user,
                )

            self.assertEqual(len(mail.outbox), 2 if i == 2 else 1)

    def test_update_item_w_missing_notification_field(self):
        """
        Scenario: Update item without changing threshold and
        notifications setting
        Expectation: No email is sent.
        """

        item = update_item(
            inventory_id=self.inventory_id,
            name="test_widget",
            item_id=self.item["id"],
            low_stock_threshold=None,
            price=100,
            user=self.user,
        )

        self.assertEqual(item["low_stock_notification"], True)
        self.assertEqual(len(mail.outbox), 0)
