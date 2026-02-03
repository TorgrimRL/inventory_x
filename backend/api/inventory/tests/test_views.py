from django.urls import reverse
from rest_framework import status

from api.inventory.contracts import ADJUST_STOCK_RESPONSES
from api.inventory.models import InventoryItem
from api.tests.base import BaseAPITestCase


class InventoryListViewTests(BaseAPITestCase):
    def test_inventory_list_view(self):
        # Setup
        InventoryItem.objects.create(name="Monitor", price=200, stock=1)

        # Execute
        response = self.client.get("/api/inventory/")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()

    assert "data" in data
    assert data["data"][0]["name"] == "Monitor"


@pytest.mark.django_db
def test_inventory_list_multiple_items(client):
    """Test that multiple items are returned correctly."""
    # Setup
    InventoryItem.objects.create(name="Monitor", price=200, stock=1)
    InventoryItem.objects.create(name="Keyboard", price=100, stock=5)

    # Execute
    response = client.get("/api/inventory/")

    # Assert
    assert response.status_code == 200
    data = response.json()

    assert "data" in data
    assert len(data["data"]) == 2  # Should return two items
    assert data["data"][0]["name"] == "Monitor"
    assert data["data"][1]["name"] == "Keyboard"


@pytest.mark.django_db
def test_inventory_list_empty(client):
    """Test that the list is empty when there are no items."""
    # Execute
    response = client.get("/api/inventory/")

    # Assert
    assert response.status_code == 200
    data = response.json()

    assert "data" in data
    assert len(data["data"]) == 0  # Should return empty list


@pytest.mark.django_db
def test_inventory_list_invalid_url(client):
    """Test that an invalid URL returns 404."""
    # Execute
    response = client.get("/api/inventory/invalid_url/")

    # Assert
    assert response.status_code == 404


@pytest.mark.django_db
def test_inventory_item_empty_name(client):
    """Test that an item with an empty name cannot be created."""
    # Setup: Trying to create an item with an empty name
    response = client.post(
        "/api/inventory/", {"name": "", "price": 100, "stock": 5}
    )

    # Assert: Should return a 400 Bad Request with validation errors
    assert response.status_code == 400
    data = response.json()
    assert "name" in data["detail"]  # Assuming the error is named 'name'


@pytest.mark.django_db
def test_inventory_item_negative_stock(client):
    """Test that an item with a negative stock cannot be created."""
    # Setup: Trying to create an item with a negative stock
    response = client.post(
        "/api/inventory/", {"name": "Test Item", "price": 100, "stock": -5}
    )

    # Assert: Should return a 400 Bad Request with validation errors
    assert response.status_code == 400
    data = response.json()
    assert "stock" in data["detail"]  # Assuming the error is named 'stock'


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
        )

        self.assert_contract(
            response,
            ADJUST_STOCK_RESPONSES,
            status.HTTP_404_NOT_FOUND,
        )
