from uuid import UUID

from django.db import transaction
from django.shortcuts import get_object_or_404

from api.inventory.decorators import audit_logger
from api.user.models import User

from .models import Inventory, InventoryItem, InventoryMembership


def get_all_items(inventory_id: UUID):
    """
    Fetches all inventory items from the database.
    Returns them as a list of dictionaries.

    Args:
        inventory_id:
    """
    queryset = InventoryItem.objects.filter(inventory_id=inventory_id).order_by(
        "id"
    )
    items = queryset.values("id", "name", "price", "stock")
    return list(items)


@audit_logger("create_item")
def create_item(inventory_id: UUID, name, price, stock):
    """
    Creates a new inventory item.
    Returns the created item as a dictionary.
    """
    try:
        item = InventoryItem.objects.create(
            inventory_id=inventory_id, name=name, price=price, stock=stock
        )
        return {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "stock": item.stock,
        }
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise Exception("Error creating inventory item") from e


@audit_logger("adjust_stock")
def adjust_stock(inventory_id: UUID, item_id: int, direction: str, amount: int):
    """
    Adjusts stock for an inventory item.
    direction: "increase" or "decrease"
    amount: integer > 0
    """
    if amount <= 0:
        raise ValueError("Amount must be a positive whole number")

    if direction not in ["increase", "decrease"]:
        raise ValueError("Invalid direction")

    try:
        with transaction.atomic():
            item = InventoryItem.objects.select_for_update().get(
                id=item_id, inventory_id=inventory_id
            )

            if direction == "increase":
                new_stock = item.stock + amount
            else:
                new_stock = item.stock - amount

            if new_stock < 0:
                raise ValueError("Stock cannot be negative")

            item.stock = new_stock
            item.save()
            return item

    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err


@audit_logger("update_item")
def update_item(item_id: int, name: str, price: int):
    """
    Updates item fields (name, price) only. Stock is not changed here.
    """
    try:
        with transaction.atomic():
            item = InventoryItem.objects.select_for_update().get(id=item_id)

            item.name = name
            item.price = price
            item.save(update_fields=["name", "price"])

            return item

    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err


def invite_user(requestor, inventory_id: str, target_email: str):
    inventory = get_object_or_404(Inventory, id=inventory_id)

    if not inventory.is_owner(requestor):
        raise PermissionError(
            "Only the inventory owner can invite new members."
        )

    try:
        target_user = User.objects.get(email=target_email)
    except User.DoesNotExist:
        raise ValueError(
            f"User with email '{target_email}' does not exist."
        ) from None

    if inventory.is_member(target_user):
        raise ValueError("User is already a member of this inventory.")

    InventoryMembership.objects.create(
        inventory=inventory,
        user=target_user,
        role=InventoryMembership.Role.EMPLOYEE,
    )
