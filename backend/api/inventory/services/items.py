from uuid import UUID

from django.db import transaction

from api.inventory.models import InventoryItem, ItemCategory


def get_all_items(inventory_id: UUID):
    """
    Fetches all inventory items from the database.
    Returns them as a list of dictionaries.

    Args:
        inventory_id:
    """
    items_qs = (
        InventoryItem.objects.filter(inventory_id=inventory_id)
        .prefetch_related("categories")
        .order_by("id")
    )
    return [
        {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "stock": item.stock,
            "low_stock_threshold": item.low_stock_threshold,
            "category_ids": [category.id for category in item.categories.all()],
        }
        for item in items_qs
    ]


def _get_validated_categories(inventory_id: UUID, category_ids: list[UUID]):
    """Ensures categories exist and returns the QuerySet."""
    if not category_ids:
        return ItemCategory.objects.none()

    unique_category_ids = set(category_ids)
    categories = ItemCategory.objects.filter(
        id__in=unique_category_ids, inventory_id=inventory_id
    )

    if categories.count() != len(unique_category_ids):
        raise ValueError(
            "One or more categories are invalid "
            "or do not belong to this inventory."
        )

    return categories


def create_item(
    inventory_id: UUID,
    name: str,
    price: int,
    stock: int,
    low_stock_threshold=None,
    category_ids: list[UUID] | None = None,
):
    try:
        with transaction.atomic():
            categories = _get_validated_categories(
                inventory_id, category_ids or []
            )

            item = InventoryItem.objects.create(
                inventory_id=inventory_id,
                name=name,
                price=price,
                stock=stock,
                low_stock_threshold=low_stock_threshold,
            )

            if category_ids:
                item.categories.set(categories)

            return {
                "id": item.id,
                "name": item.name,
                "price": item.price,
                "stock": item.stock,
                "low_stock_threshold": item.low_stock_threshold,
                "category_ids": category_ids or [],
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


def update_item(
    inventory_id: UUID,
    item_id: UUID,
    name: str,
    price: int,
    low_stock_threshold: int | None,
    category_ids: list[UUID] | None = None,
):
    """
    Updates item fields. Stock is not changed here.
    """
    try:
        with transaction.atomic():
            item = InventoryItem.objects.select_for_update().get(
                id=item_id, inventory_id=inventory_id
            )

            if category_ids is not None:
                categories = _get_validated_categories(
                    item.inventory_id, category_ids
                )

            item.name = name
            item.price = price
            item.low_stock_threshold = low_stock_threshold
            item.save(update_fields=["name", "price", "low_stock_threshold"])

            if category_ids is not None:
                item.categories.set(categories)

            return item

    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err


def delete_item(inventory_id: UUID, item_id: UUID) -> None:
    """
    Deletes an inventory item belonging to the active inventory.
    """
    try:
        item = InventoryItem.objects.get(id=item_id, inventory_id=inventory_id)
        item.delete()
    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err
