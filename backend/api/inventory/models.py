from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any, ClassVar

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import IntegrityError, models, transaction
from django.db.models.signals import m2m_changed
from django.dispatch import receiver
from django.utils.translation import gettext_lazy as _

org_number_validator = RegexValidator(
    regex=r"^\d{9}$",
    message="Organization number must be 9 digits",
)


class InventoryAlreadyExistsError(Exception):
    default_message = "Organization number is already registered"

    def __init__(self, message: str | None = None):
        super().__init__(message or self.default_message)


class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    org_number = models.CharField(
        max_length=9,
        unique=True,
        validators=[org_number_validator],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    # NOTE: Type hint for dynamic reverse relationship
    if TYPE_CHECKING:
        memberships: models.Manager[InventoryMembership]

    @classmethod
    @transaction.atomic
    def register_with_owner(
        cls,
        *,
        user,
        name: str,
        org_number: str,
    ) -> tuple[Inventory, InventoryMembership]:
        inventory = cls(name=name, org_number=org_number)
        inventory.full_clean(validate_unique=False)

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

    def is_owner(self, user) -> bool:
        if not user.is_authenticated:
            return False

        return self.memberships.filter(
            user=user, role=InventoryMembership.Role.OWNER
        ).exists()

    def is_employee(self, user) -> bool:
        if not user.is_authenticated:
            return False

        return self.memberships.filter(
            user=user, role=InventoryMembership.Role.EMPLOYEE
        ).exists()

    def is_member(self, user) -> bool:
        if not user.is_authenticated:
            return False

        return self.memberships.filter(user=user).exists()

    def __str__(self):
        return f"{self.name} ({self.org_number})"


class ItemCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory: models.ForeignKey[Inventory] = models.ForeignKey(
        "Inventory",
        on_delete=models.CASCADE,
        related_name="categories",
        db_index=True,
    )
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints: ClassVar[list[models.BaseConstraint]] = [
            models.UniqueConstraint(
                fields=["inventory", "name"],
                name="unique_category_name_per_inventory",
            )
        ]

    def __str__(self):
        return self.name


class InventoryCustomField(models.Model):
    """
    Defines the schema for custom fields available within a specific inventory.
    """

    class DataType(models.TextChoices):
        TEXT = "text", _("Text")
        NUMBER = "number", _("Number")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory: models.ForeignKey[Inventory] = models.ForeignKey(
        "Inventory", on_delete=models.CASCADE, related_name="custom_fields"
    )
    name = models.CharField(max_length=255)
    data_type = models.CharField(
        max_length=20, choices=DataType.choices, default=DataType.TEXT
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("inventory", "name")

    def __str__(self):
        return f"{self.inventory.name} - {self.name} ({self.data_type})"


class InventoryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory: models.ForeignKey[Inventory] = models.ForeignKey(
        "Inventory",
        on_delete=models.CASCADE,
        related_name="items",
        db_index=True,
    )
    categories: models.ManyToManyField[ItemCategory, InventoryItem] = (
        models.ManyToManyField(
            "ItemCategory",
            related_name="items",
            blank=True,
        )
    )
    inventory_id: uuid.UUID
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    price = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(null=True, blank=True)
    if TYPE_CHECKING:
        custom_fields: dict[str, Any]
    else:
        custom_fields = models.JSONField(
            default=dict,
            blank=True,
            help_text=_(
                "Stores custom field values as a dictionary: "
                "{'field_id': 'value'}"
            ),
        )
    low_stock_notification = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class InventoryMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        EMPLOYEE = "employee", "Employee"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory: models.ForeignKey[Inventory] = models.ForeignKey(
        Inventory, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="inventory_memberships",
    )
    role = models.CharField(max_length=20, choices=Role.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints: ClassVar[list[models.BaseConstraint]] = [
            models.UniqueConstraint(
                fields=["inventory", "user"],
                name="unique_inventory_membership",
            )
        ]

    def __str__(self):
        return f"{self.user} -> {self.inventory} as {self.role}"


@receiver(m2m_changed, sender=InventoryItem.categories.through)
def enforce_category_inventory_match(
    sender, instance, action, pk_set, **kwargs
):
    """
    Ensures that an InventoryItem and its ItemCategories always belong
    to the same Inventory. This runs automatically on .set() or .add().
    """
    if action == "pre_add" and pk_set:
        invalid_count = (
            ItemCategory.objects.filter(id__in=pk_set)
            .exclude(inventory_id=instance.inventory_id)
            .count()
        )

        if invalid_count > 0:
            raise ValueError(
                "Model Guard: Item and Category must belong "
                "to the same inventory."
            )


class StockLog(models.Model):
    """
    Audit log for actions performed on Inventory items.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    # Item State
    item = models.ForeignKey(
        "InventoryItem", on_delete=models.CASCADE, null=True, blank=True
    )
    item_name = models.CharField(max_length=255, null=True, blank=True)
    price = models.IntegerField(null=True, blank=True)

    # Action Details
    action = models.CharField(max_length=256)
    amount = models.IntegerField(null=True, blank=True)
    direction = models.CharField(max_length=50, null=True, blank=True)
    current_stock = models.IntegerField(null=True, blank=True)

    # Actor Details
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )

    class Meta:
        ordering = ("-timestamp",)
