from django.db import transaction

from .models import InventoryItem


def get_all_items():
    """
    Fetches all inventory items from the database and converts them
    to a list of dictionaries.
    """
    # Query the database
    queryset = InventoryItem.objects.all()

    # Select specific fields and convert to a dictionary
    items = queryset.values("id", "name", "price", "stock")

    # Force conversion to a standard Python list
    return list(items)


def adjust_stock(item_id: int, direction: str, amount: int):
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
            item = InventoryItem.objects.select_for_update().get(id=item_id)

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
