import uuid
from typing import TYPE_CHECKING, ClassVar

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import IntegrityError, models, transaction

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
        memberships: models.Manager["InventoryMembership"]

    @classmethod
    @transaction.atomic
    def register_with_owner(
        cls,
        *,
        user,
        name: str,
        org_number: str,
    ) -> tuple["Inventory", "InventoryMembership"]:
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


class InventoryItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory: models.ForeignKey["Inventory"] = models.ForeignKey(
        "Inventory",
        on_delete=models.CASCADE,
        related_name="items",
        db_index=True,
    )
    name = models.CharField(max_length=255)
    price = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.name


class InventoryMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        EMPLOYEE = "employee", "Employee"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory: models.ForeignKey["Inventory"] = models.ForeignKey(
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
