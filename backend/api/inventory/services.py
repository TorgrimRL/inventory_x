from .models import Inventory, InventoryItem


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


def register_inventory(*, user, name: str, org_number: str):
    return Inventory.register_with_owner(
        user=user,
        name=name,
        org_number=org_number,
    )
