import uuid

from django.test import TestCase

from api.inventory.models import Inventory, InventoryItem, InventoryMembership
from api.inventory.services import adjust_stock, get_all_items, invite_user
from api.user.models import User


class InventoryServicesTests(TestCase):
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

        # Assert
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["name"], "Mouse")
        self.assertEqual(results[1]["price"], 100)

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
                item_id=9999,
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


class InviteUserServicesTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create(
            email="owner@example.com", password="password"
        )
        self.inventory, _ = Inventory.register_with_owner(
            user=self.owner, name="Test Corp", org_number="123456789"
        )
        self.target_user = User.objects.create(
            email="target@example.com", password="password"
        )

    def test_invite_user_success(self):
        """Owner can invite a user, who becomes an employee."""
        invite_user(self.owner, str(self.inventory.id), self.target_user.email)

        membership = InventoryMembership.objects.get(
            inventory=self.inventory, user=self.target_user
        )
        self.assertEqual(membership.role, InventoryMembership.Role.EMPLOYEE)

    def test_invite_user_not_owner_raises_permission_error(self):
        """Non-owners cannot invite users."""
        stranger = User.objects.create(
            email="stranger@example.com", password="password"
        )

        with self.assertRaises(PermissionError) as ctx:
            invite_user(
                stranger, str(self.inventory.id), self.target_user.email
            )

        self.assertIn("Only the inventory owner", str(ctx.exception))

    def test_invite_user_target_does_not_exist(self):
        """Inviting a non-existent email raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            invite_user(self.owner, str(self.inventory.id), "ghost@example.com")

        self.assertIn("does not exist", str(ctx.exception))

    def test_invite_user_already_member(self):
        """Inviting an existing member raises ValueError."""
        invite_user(self.owner, str(self.inventory.id), self.target_user.email)

        with self.assertRaises(ValueError) as ctx:
            invite_user(
                self.owner, str(self.inventory.id), self.target_user.email
            )

        self.assertIn("already a member", str(ctx.exception))
