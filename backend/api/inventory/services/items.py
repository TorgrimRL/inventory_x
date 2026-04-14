from uuid import UUID

from django.core.files.uploadedfile import UploadedFile
from django.db import transaction

from api.inventory.decorators import audit_logger
from api.inventory.models import InventoryItem, ItemCategory


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
            "One or more categories are invalid or do not belong to this inventory."
        )

    return categories


def get_all_items(inventory_id: UUID):
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
            "low_stock_notification": item.low_stock_notification,
            "category_ids": [
                str(category.id) for category in item.categories.all()
            ],
            "image_url": item.image_url,
        }
        for item in items_qs
    ]


@audit_logger("create_item")
def create_item(
    inventory_id: UUID,
    name: str,
    price: int,
    stock: int,
    low_stock_threshold=None,
    low_stock_notification=False,
    category_ids: list[UUID] | None = None,
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
                low_stock_notification=low_stock_notification,
                image=image,
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
                "category_ids": [str(category.id) for category in categories],
                "image_url": item.image_url,
            }
    except ValueError as ve:
        raise ve
    except Exception as e:
        raise Exception("Error creating inventory item") from e


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


@audit_logger("update_item")
def update_item(
    inventory_id: UUID,
    item_id: UUID,
    name: str,
    price: int,
    low_stock_threshold: int | None,
    low_stock_notification=None,
    category_ids: list[UUID] | None = None,
    image: UploadedFile | None = None,
    remove_image: bool = False,
    user=None,
):
    try:
        with transaction.atomic():
            item = InventoryItem.objects.select_for_update().get(
                id=item_id, inventory_id=inventory_id
            )

            categories: list[ItemCategory] = []
            if category_ids is not None:
                categories = _get_validated_categories(
                    item.inventory_id, category_ids
                )

            item.name = name
            item.price = price
            item.low_stock_threshold = low_stock_threshold

            update_fields = ["name", "price", "low_stock_threshold"]

            if low_stock_notification is not None:
                item.low_stock_notification = low_stock_notification
                update_fields.append("low_stock_notification")

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

            if category_ids is not None:
                item.categories.set(categories)

            return item

    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err


def delete_item(inventory_id: UUID, item_id: UUID) -> None:
    try:
        item = InventoryItem.objects.get(id=item_id, inventory_id=inventory_id)
        item.delete()
    except InventoryItem.DoesNotExist as err:
        raise LookupError("Item not found") from err
