import uuid

from django.core import mail

from api.inventory.models import Inventory, InventoryMembership
from api.inventory.services.items import adjust_stock, create_item
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

        # Clear the outbox just in case create_item triggered anything
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

        # Assert mail was sent
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

        # Assert NO mail was sent
        self.assertEqual(len(mail.outbox), 0)

    def test_adjust_stock_notifications_disabled(
        self,
    ):
        """
        Scenario: Item stock drops below threshold, notifications are False.
        Expectation: No email is sent.
        """

        # Setup: Create an item with notifications DISABLED
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

        # Action: Decrease stock to 4 (below threshold)
        adjust_stock(
            inventory_id=self.inventory_id,
            item_id=silent_item["id"],
            direction="decrease",
            amount=6,
            user=self.user,
        )

        # Assert NO mail was sent
        self.assertEqual(len(mail.outbox), 0)

    def test_spam_notifications_protection(
        self,
    ):
        """
        Scenario: Item stock drops below threshold multiple times,
        or adjust_stock is called multiple times while already below threshold.
        Expectation: One email is sent.
        """

        # Setup: Create an item with notifications DISABLED
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

        # Action: Decrease stock to 4 (below threshold)
        for _ in range(3):
            adjust_stock(
                inventory_id=self.inventory_id,
                item_id=silent_item["id"],
                direction="decrease",
                amount=1,
                user=self.user,
            )

        # Assert one mail was sent
        self.assertEqual(len(mail.outbox), 1)
