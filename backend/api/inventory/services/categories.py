from uuid import UUID

from django.db.utils import IntegrityError

from api.inventory.models import ItemCategory


def get_all_categories(inventory_id: UUID) -> list[dict]:
    queryset = ItemCategory.objects.filter(inventory_id=inventory_id).order_by(
        "name"
    )
    return list(queryset.values("id", "name"))


def create_category(inventory_id: UUID, name: str) -> dict:
    try:
        category = ItemCategory.objects.create(
            inventory_id=inventory_id, name=name
        )
        return {"id": category.id, "name": category.name}
    except IntegrityError as err:
        raise ValueError(
            "A category with this name already exists in this inventory."
        ) from err


def delete_category(inventory_id: UUID, category_id: UUID) -> None:
    try:
        category = ItemCategory.objects.get(
            id=category_id, inventory_id=inventory_id
        )
        category.delete()
    except ItemCategory.DoesNotExist as err:
        raise LookupError("Category not found") from err
