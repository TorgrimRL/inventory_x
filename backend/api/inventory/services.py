from .models import InventoryItem


def get_all_items():
    """
    Fetches all inventory items from the database.
    Returns them as a list of dictionaries.
    """
    try:
        queryset = InventoryItem.objects.all()
        items = queryset.values("id", "name", "price", "stock")
        return list(items)
    except Exception as e:
        raise Exception("Failed to fetch items") from e


def create_item(name, price, stock):
    """
    Creates a new inventory item.
    Returns the created item as a dictionary.
    """
    try:
        if InventoryItem.objects.filter(name=name).exists():
            raise ValueError(f"Item with name '{name}' already exists.")

        item = InventoryItem.objects.create(name=name, price=price, stock=stock)
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
        item = InventoryItem.objects.get(id=item_id)
    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err

    if direction == "increase":
        item.stock += amount
    else:
        item.stock -= amount

    item.save()
    return item
