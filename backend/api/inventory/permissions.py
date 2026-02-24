from rest_framework import permissions

from .context import get_active_membership_or_raise
from .models import InventoryMembership


class IsActiveInventoryMember(permissions.BasePermission):
    """
    Grants access only if the request has a valid active inventory
    in the session and the authenticated user is
    a member of that inventory.
    On success, attaches:
      - request.active_inventory_membership
      - request.active_inventory
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        membership = get_active_membership_or_raise(request)
        request.active_inventory_membership = membership
        request.active_inventory = membership.inventory
        return True


class IsActiveInventoryOwner(IsActiveInventoryMember):
    """
    Grant permission only if the request user is the OWNER of the active
    inventory currently selected in their session.
    """

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        membership = getattr(request, "active_inventory_membership", None)

        if membership is None:
            return False

        return membership.role == InventoryMembership.Role.OWNER
