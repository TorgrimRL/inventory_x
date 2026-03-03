from __future__ import annotations

from uuid import UUID

from rest_framework.exceptions import APIException
from rest_framework.request import Request

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


def get_active_membership_or_raise(request) -> InventoryMembership:
    cached = getattr(request, "_active_inventory_membership", None)
    if cached is not None:
        return cached

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

    request._active_inventory_membership = membership
    return membership


def get_request_active_membership(request: Request) -> InventoryMembership:
    membership = getattr(request, "active_inventory_membership", None)
    if membership is None:
        raise RuntimeError(
            "active_inventory_membership was not set on request. "
            "Did you forget HasActiveInventoryMembership?"
        )
    return membership
