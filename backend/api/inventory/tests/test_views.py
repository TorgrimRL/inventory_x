import pytest

from api.inventory.models import InventoryItem


@pytest.mark.django_db
def test_inventory_list_view(client):
    # Setup
    InventoryItem.objects.create(name="Monitor", price=200, stock=1)

    # Execute
    response = client.get("/api/inventory/")

    # Assert
    assert response.status_code == 200
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
