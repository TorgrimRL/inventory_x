from django.core.exceptions import ValidationError as DjangoValidationError
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
    pass


@transaction.atomic
def register_inventory(*, user, name: str, org_number: str):
    if user is None or not user.is_authenticated:
        raise PermissionError(
            "Authenticated user is required to register an inventory."
        )

    inventory = Inventory(
        name=(name or "").strip(),
        org_number=(org_number or "").strip(),
    )

    try:
        inventory.full_clean()
    except DjangoValidationError as err:
        if (
            hasattr(err, "error_dict")
            and "org_number" in err.error_dict
            and any(e.code == "unique" for e in err.error_dict["org_number"])
        ):
            raise InventoryAlreadyExistsError(
                "An inventory with the same organization number already exists."
            ) from None
        raise

    try:
        inventory.save()
        membership = InventoryMembership.objects.create(
            inventory=inventory,
            user=user,
            role=InventoryMembership.Role.OWNER,
        )
    except IntegrityError:
        # race condition
        raise InventoryAlreadyExistsError(
            "Organization number is already registered"
        ) from None

    return inventory, membership
