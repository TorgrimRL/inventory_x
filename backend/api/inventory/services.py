from django.db import IntegrityError, transaction

from .models import Inventory, InventoryItem, InventoryMembership


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


class InventoryAlreadyExistsError(Exception):
    default_message = "Organization number is already registered"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.default_message)


@transaction.atomic
def register_inventory(*, user, name: str, org_number: str):
    inventory = Inventory(
        name=(name or "").strip(),
        org_number=(org_number or "").strip(),
    )

    inventory.full_clean(validate_unique=False)

    if Inventory.objects.filter(org_number=inventory.org_number).exists():
        raise InventoryAlreadyExistsError()

    try:
        inventory.save()
    except IntegrityError:
        raise InventoryAlreadyExistsError() from None

    membership = InventoryMembership.objects.create(
        inventory=inventory,
        user=user,
        role=InventoryMembership.Role.OWNER,
    )

    return inventory, membership
