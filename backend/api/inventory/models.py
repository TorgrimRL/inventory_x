# api/inventory/models.py
import uuid
from typing import ClassVar

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

org_number_validator = RegexValidator(
    regex=r"^\d{9}$",
    message="Organization number must be 9 digits",
)


class Inventory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    org_number = models.CharField(
        max_length=9,
        unique=True,
        validators=[org_number_validator],
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.org_number})"


class InventoryItem(models.Model):
    name = models.CharField(max_length=255)
    price = models.IntegerField()
    stock = models.IntegerField(default=0)

    def __str__(self):
        return self.name


class InventoryMembership(models.Model):
    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        EMPLOYEE = "employee", "Employee"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    inventory = models.ForeignKey(
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
