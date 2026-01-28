import pytest
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient

from api.inventory.models import Inventory, InventoryMembership
from api.inventory.services import (
    InventoryAlreadyExistsError,
    register_inventory,
)
from api.user.models import User


@pytest.mark.django_db
def test_register_inventory_happy_path_creates_inventory_and_owner_membership():
    user = User.objects.create_user(email="afadsfasdfa@test.com", password="pw")

    inventory, membership = register_inventory(
        user=user,
        name="Ola AS",
        org_number="123456789",
    )

    assert Inventory.objects.filter(id=inventory.id).exists()
    assert membership.inventory_id == inventory.id
    assert membership.user_id == user.id
    assert membership.role == InventoryMembership.Role.OWNER


@pytest.mark.django_db
def test_register_inventory_fails_if_org_number_exists():
    user1 = User.objects.create_user(email="a@test.com", password="pw")
    user2 = User.objects.create_user(email="b@test.com", password="pw")

    register_inventory(user=user1, name="Ola AS", org_number="123456789")

    with pytest.raises(InventoryAlreadyExistsError):
        register_inventory(
            user=user2, name="Another Company", org_number="123456789"
        )


@pytest.mark.django_db
def test_register_inventory_fails_when_required_fields_missing():
    user = User.objects.create_user(email="a@test.com", password="pw")

    with pytest.raises(ValidationError):
        register_inventory(user=user, name="", org_number="")


@pytest.mark.django_db
def test_register_inventory_requires_authentication():
    client = APIClient()

    res = client.post(
        "/api/inventory/register/",
        {"name": "Ola AS", "orgNumber": "123456789"},
        format="json",
    )

    # Kan være 401 eller 403 avhengig av auth/csrf-oppsett.
    assert res.status_code in (401, 403)


@pytest.mark.django_db
def test_register_inventory_success_returns_201_and_creates_membership():
    client = APIClient()
    user = User.objects.create_user(email="a@test.com", password="pw")
    client.force_authenticate(user=user)

    res = client.post(
        "/api/inventory/register/",
        {"name": "Ola AS", "orgNumber": "123456789"},
        format="json",
    )

    assert res.status_code == 201
    body = res.json()
    assert body["message"] == "Inventory registered"
    assert "id" in body

    inv_id = body["id"]
    assert Inventory.objects.filter(id=inv_id).exists()
    assert InventoryMembership.objects.filter(
        user=user, inventory_id=inv_id, role="owner"
    ).exists()


@pytest.mark.django_db
def test_register_inventory_duplicate_org_number_returns_400():
    existing = Inventory.objects.create(name="Existing", org_number="123456789")

    client = APIClient()
    user = User.objects.create_user(email="a@test.com", password="pw")
    client.force_authenticate(user=user)

    res = client.post(
        "/api/inventory/register/",
        {"name": "Another", "orgNumber": existing.org_number},
        format="json",
    )

    assert res.status_code == 400
    body = res.json()
    assert "errors" in body
    assert "orgNumber" in body["errors"]
