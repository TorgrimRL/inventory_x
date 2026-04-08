import uuid

from django.urls import reverse
from rest_framework import status

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.contracts.create_category import CREATE_CATEGORY_RESPONSES
from api.inventory.contracts.delete_category import DELETE_CATEGORY_RESPONSES
from api.inventory.contracts.list_categories import LIST_CATEGORIES_RESPONSES
from api.inventory.models import Inventory, InventoryMembership, ItemCategory
from api.tests.base import BaseAPITestCase


class CategoryViewTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="owner@test.com", password="password123"
        )
        self.client.force_authenticate(self.user)

        # Main active inventory
        self.inventory = Inventory.objects.create(
            name="Main Inv", org_number="111111111"
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        # Set active inventory in session
        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        self.list_create_url = reverse("inventory-categories")

    def test_list_categories_empty(self):
        res = self.client.get(self.list_create_url)
        data = self.assert_contract(
            res, LIST_CATEGORIES_RESPONSES, status.HTTP_200_OK
        )
        self.assertEqual(len(data), 0)

    def test_create_category_success(self):
        res = self.client.post(
            self.list_create_url, {"name": "Electronics"}, format="json"
        )
        self.assert_contract(
            res, CREATE_CATEGORY_RESPONSES, status.HTTP_201_CREATED
        )

        body = res.json()
        self.assertEqual(body["name"], "Electronics")
        self.assertTrue("id" in body)

        self.assertEqual(
            ItemCategory.objects.filter(inventory=self.inventory).count(), 1
        )

    def test_create_duplicate_category_returns_400(self):
        ItemCategory.objects.create(
            inventory=self.inventory, name="Electronics"
        )

        res = self.client.post(
            self.list_create_url, {"name": "Electronics"}, format="json"
        )
        self.assert_contract(
            res, CREATE_CATEGORY_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_list_categories_returns_multiple_and_is_isolated(self):
        ItemCategory.objects.create(inventory=self.inventory, name="Cat 1")
        ItemCategory.objects.create(inventory=self.inventory, name="Cat 2")

        other_inv = Inventory.objects.create(
            name="Other Inv", org_number="222222222"
        )
        ItemCategory.objects.create(inventory=other_inv, name="Other Cat")

        res = self.client.get(self.list_create_url)
        data = self.assert_contract(
            res, LIST_CATEGORIES_RESPONSES, status.HTTP_200_OK
        )

        assert isinstance(data, list)

        self.assertEqual(len(data), 2)
        category_names = [c["name"] for c in data]
        self.assertIn("Cat 1", category_names)
        self.assertIn("Cat 2", category_names)
        self.assertNotIn("Other Cat", category_names)

    def test_delete_category_success(self):
        category = ItemCategory.objects.create(
            inventory=self.inventory, name="To Delete"
        )
        url = reverse("inventory-category-detail", args=[category.id])

        res = self.client.delete(url)
        self.assert_contract(
            res, DELETE_CATEGORY_RESPONSES, status.HTTP_204_NO_CONTENT
        )

        self.assertFalse(ItemCategory.objects.filter(id=category.id).exists())

    def test_delete_category_not_found(self):
        url = reverse("inventory-category-detail", args=[uuid.uuid4()])
        res = self.client.delete(url)
        self.assert_contract(
            res, DELETE_CATEGORY_RESPONSES, status.HTTP_404_NOT_FOUND
        )

    def test_delete_category_from_other_inventory_returns_404(self):
        other_inv = Inventory.objects.create(
            name="Other Inv", org_number="222222222"
        )
        other_category = ItemCategory.objects.create(
            inventory=other_inv, name="Other Cat"
        )

        url = reverse("inventory-category-detail", args=[other_category.id])
        res = self.client.delete(url)

        self.assert_contract(
            res, DELETE_CATEGORY_RESPONSES, status.HTTP_404_NOT_FOUND
        )
