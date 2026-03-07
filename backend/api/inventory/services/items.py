from uuid import UUID

from django.db import transaction

from api.inventory.models import InventoryItem


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


def adjust_stock(
    inventory_id: UUID, item_id: UUID, direction: str, amount: int
):
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


def update_item(item_id: UUID, name: str, price: int):
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
