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
