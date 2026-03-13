from api.inventory.models import InventoryMembership


def remove_member(request_user, inventory, membership_id):
    """
    Removes an employee membership from the given inventory.
    """

    try:
        membership = InventoryMembership.objects.get(
            id=membership_id,
            inventory=inventory,
        )
    except InventoryMembership.DoesNotExist as err:
        raise LookupError("Membership not found") from err

    # Prevent self removal
    if membership.user.id == request_user.id:
        raise ValueError("Owners cannot remove their own access.")

    # Only employee memberships can be removed
    if membership.role != InventoryMembership.Role.EMPLOYEE:
        raise ValueError("Only employee memberships can be removed.")

    membership.delete()

    return membership_id
