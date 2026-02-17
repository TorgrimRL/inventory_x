from __future__ import annotations

from uuid import UUID

from rest_framework.exceptions import APIException

from api.inventory.models import InventoryMembership

SESSION_ACTIVE_INVENTORY_KEY = "active_inventory_id"


class NoActiveInventorySelected(APIException):
    status_code = 409
    default_detail = "No active inventory selected"
    default_code = "no_active_inventory"


def get_active_inventory_id(request) -> UUID | None:
    raw = request.session.get(SESSION_ACTIVE_INVENTORY_KEY)
    if not raw:
        return None
    try:
        return UUID(str(raw))
    except ValueError:
        return None


def require_active_membership(request) -> InventoryMembership:
    """
    Returns InventoryMembership for the active inventory.
    Raises 409 if missing/invalid/not member.
    """
    inv_id = get_active_inventory_id(request)
    if not inv_id:
        raise NoActiveInventorySelected()

    membership = (
        InventoryMembership.objects.select_related("inventory")
        .filter(user=request.user, inventory_id=inv_id)
        .first()
    )
    if not membership:
        request.session.pop(SESSION_ACTIVE_INVENTORY_KEY, None)
        raise NoActiveInventorySelected()

    return membership
