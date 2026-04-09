from uuid import UUID

from django.db import transaction

from api.inventory.decorators import audit_logger, notify_low_stock
from api.inventory.models import InventoryItem, ItemCategory


def get_all_items(inventory_id: UUID):
    try:
        items = InventoryItem.objects.filter(
            inventory_id=inventory_id
        ).prefetch_related("categories")
        return [
            {
                "id": item.id,
                "name": item.name,
                "price": item.price,
                "stock": item.stock,
                "low_stock_threshold": item.low_stock_threshold,
                "category_ids": [cat.id for cat in item.categories.all()],
            }
            for item in items
        ]
    except Exception as e:
        raise Exception("Error fetching inventory items") from e


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


@audit_logger("create_item")
def create_item(
    inventory_id: UUID,
    name: str,
    price: int,
    stock: int,
    low_stock_threshold=None,
    low_stock_notification=False,
    category_ids: list[UUID] | None = None,
    user=None,
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
                low_stock_notification=low_stock_notification,
            )

            if category_ids:
                item.categories.set(categories)

            return {
                "id": item.id,
                "name": item.name,
                "price": item.price,
                "stock": item.stock,
                "low_stock_threshold": item.low_stock_threshold,
                "low_stock_notification": item.low_stock_notification,
                "category_ids": category_ids or [],
            }
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise Exception("Error creating inventory item") from e


@notify_low_stock
@audit_logger("adjust_stock")
def adjust_stock(
    inventory_id: UUID, item_id: UUID, direction: str, amount: int, user=None
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


@notify_low_stock
@audit_logger("update_item")
def update_item(
    inventory_id: UUID,
    item_id: UUID,
    name: str,
    price: int,
    low_stock_threshold: int | None,
    low_stock_notification=None,
    category_ids: list[UUID] | None = None,
    user=None,
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

            # build the update fields dynamically
            update_fields = ["name", "price", "low_stock_threshold"]

            if low_stock_notification is not None:
                item.low_stock_notification = low_stock_notification
                update_fields.append("low_stock_notification")

            item.save(update_fields=update_fields)

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
