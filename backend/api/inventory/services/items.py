from typing import Any
from uuid import UUID

from django.core.files.uploadedfile import UploadedFile
from django.db import transaction

from api.inventory.decorators import audit_logger, notify_low_stock
from api.inventory.models import InventoryItem, ItemCategory


def _serialize_item(item: InventoryItem) -> dict[str, Any]:
    return {
        "id": item.id,
        "name": item.name,
        "price": item.price,
        "stock": item.stock,
        "low_stock_threshold": item.low_stock_threshold,
        "low_stock_notification": item.low_stock_notification,
        "category_ids": [
            str(category.id) for category in item.categories.all()
        ],
        "custom_fields": item.custom_fields,
        "image_url": item.image_url,
    }


def get_all_items(inventory_id: UUID):
    items_qs = (
        InventoryItem.objects.filter(inventory_id=inventory_id)
        .prefetch_related("categories")
        .order_by("id")
    )

    return [_serialize_item(item) for item in items_qs]


def _get_validated_categories(
    inventory_id: UUID, category_ids: list[UUID]
) -> list[ItemCategory]:
    if not category_ids:
        return []

    categories = list(
        ItemCategory.objects.filter(
            inventory_id=inventory_id,
            id__in=set(category_ids),
        )
    )

    if len(categories) != len(set(category_ids)):
        raise ValueError(
            "One or more categories are invalid or do not belong "
            "to this inventory."
        )

    return categories


@notify_low_stock
@audit_logger("create_item")
def create_item(
    inventory_id: UUID,
    name: str,
    price: int,
    stock: int,
    low_stock_threshold=None,
    low_stock_notification=False,
    category_ids: list[UUID] | None = None,
    custom_fields: dict[str, Any] | None = None,
    image: UploadedFile | None = None,
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
                custom_fields=custom_fields or {},
                low_stock_notification=low_stock_notification,
                image=image,
            )

            if category_ids:
                item.categories.set(categories)

            return _serialize_item(item)
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise Exception("Error creating inventory item") from e


@notify_low_stock
@audit_logger("adjust_stock")
def adjust_stock(
    inventory_id: UUID, item_id: UUID, direction: str, amount: int, user=None
):
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
    name: str | None = None,
    price: int | None = None,
    low_stock_threshold: int | None = None,
    low_stock_notification: bool | None = None,
    category_ids: list[UUID] | None = None,
    custom_fields: dict[str, Any] | None = None,
    image: UploadedFile | None = None,
    remove_image: bool = False,
    user=None,
):
    try:
        with transaction.atomic():
            item = InventoryItem.objects.select_for_update().get(
                id=item_id, inventory_id=inventory_id
            )

            if category_ids is not None:
                categories = _get_validated_categories(
                    item.inventory_id, category_ids
                )
                item.categories.set(categories)

            if name is not None:
                item.name = name
            if price is not None:
                item.price = price

            item.low_stock_threshold = low_stock_threshold

            if custom_fields is not None:
                if not isinstance(item.custom_fields, dict):
                    item.custom_fields = {}
                item.custom_fields.update(custom_fields)

            if low_stock_notification is not None:
                item.low_stock_notification = low_stock_notification

            update_fields = [
                "name",
                "price",
                "low_stock_threshold",
                "custom_fields",
                "low_stock_notification",
            ]

            if remove_image and item.image:
                item.image.delete(save=False)
                item.image = None  # type: ignore[assignment]
                update_fields.append("image")
            elif image is not None:
                if item.image:
                    item.image.delete(save=False)
                item.image = image  # type: ignore[assignment]
                update_fields.append("image")

            item.save(update_fields=update_fields)
            return _serialize_item(item)

    except InventoryItem.DoesNotExist as err:
        raise ValueError("Item not found in this inventory.") from err


def delete_item(inventory_id: UUID, item_id: UUID) -> None:
    try:
        item = InventoryItem.objects.get(id=item_id, inventory_id=inventory_id)
        item.delete()
    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err
