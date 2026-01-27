import pytest

from api.inventory.models import InventoryItem
from api.inventory.services import get_all_items, adjust_stock

from api.inventory import services


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


@pytest.mark.django_db
def test_adjust_stock_increase():
    item = InventoryItem.objects.create(name="Milk", price=20, stock=10)
    updated_item = adjust_stock(item_id=item.id, direction="increase", amount=5)
    assert updated_item.stock == 15


@pytest.mark.django_db
def test_adjust_stock_decrease():
    item = InventoryItem.objects.create(name="Bread", price=30, stock=10)
    updated_item = services.adjust_stock(
        item_id=item.id, direction="decrease", amount=4
    )
    assert updated_item.stock == 6


@pytest.mark.django_db
def test_adjust_stock_invalid_amount():
    item = InventoryItem.objects.create(name="Milk", price=10, stock=10)

    with pytest.raises(ValueError):
        adjust_stock(item.id, "increase", 0)
