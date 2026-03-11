from django.shortcuts import get_object_or_404

from api.inventory.models import Inventory, InventoryMembership
from api.user.models import User


def invite_user(requestor, inventory_id: str, target_email: str):
    inventory = get_object_or_404(Inventory, id=inventory_id)

    if not inventory.is_owner(requestor):
        raise PermissionError(
            "Only the inventory owner can invite new members."
        )

    try:
        target_user = User.objects.get(email=target_email)
    except User.DoesNotExist:
        raise ValueError(
            f"User with email '{target_email}' does not exist."
        ) from None

    if inventory.is_member(target_user):
        raise ValueError("User is already a member of this inventory.")

    InventoryMembership.objects.create(
        inventory=inventory,
        user=target_user,
        role=InventoryMembership.Role.EMPLOYEE,
    )
