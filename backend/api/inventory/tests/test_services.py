import pytest
from api.inventory.models import InventoryItem
from api.inventory.services import get_all_items


@pytest.mark.django_db
def test_get_all_items_returns_correct_data():
    # Setup
    InventoryItem.objects.create(name="Mouse", price=50, stock=10)
    InventoryItem.objects.create(name="Keyboard", price=100, stock=5)

    # Execute
    results = get_all_items()

    # Assert
    assert len(results) == 2
    assert results[0]["name"] == "Mouse"
    assert results[1]["price"] == 100
