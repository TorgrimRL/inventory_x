import json

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
def test_adjust_stock_view_increase(client):
    item = InventoryItem.objects.create(name="Milk", price=10, stock=10)

    response = client.post(
        f"/api/inventory/{item.id}/adjust-stock/",
        data='{"direction":"increase","amount":5}',
        content_type="application/json",
        HTTP_X_AUTH="1",
    )

    assert response.status_code == 200
    assert response.json()["stock"] == 15


@pytest.mark.django_db
def test_adjust_stock_view_decrease(client):
    item = InventoryItem.objects.create(name="Milk", price=20, stock=10)

    response = client.post(
        f"/api/inventory/{item.id}/adjust-stock/",
        data=json.dumps({"direction": "decrease", "amount": 3}),
        content_type="application/json",
        HTTP_X_AUTH="1",
    )

    assert response.status_code == 200
    assert response.json()["stock"] == 7


@pytest.mark.django_db
def test_adjust_stock_view_invalid_amount(client):
    item = InventoryItem.objects.create(name="Milk", price=10, stock=10)

    response = client.post(
        f"/api/inventory/{item.id}/adjust-stock/",
        data='{"direction":"increase","amount":-1}',
        content_type="application/json",
        HTTP_X_AUTH="1",
    )

    assert response.status_code == 400


@pytest.mark.django_db
def test_adjust_stock_requires_authenticator(client):
    item = InventoryItem.objects.create(name="Milk", price=10, stock=10)

    response = client.post(
        f"/api/inventory/{item.id}/adjust-stock/",
        data='{"direction":"increase","amount":5}',
        content_type="application/json",
    )

    assert response.status_code == 401
