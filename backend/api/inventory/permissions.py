from rest_framework import permissions
from rest_framework.exceptions import NotFound

from .context import get_active_membership_or_raise
from .models import Inventory


class IsInventoryOwner(permissions.BasePermission):
    """
    Grant permission only if the request user is the OWNER of the inventory.

    ASSUMPTION:
        This permission expects the URL kwarg to be exactly 'inventory_id'.
        Example URL: path('inventories/<uuid:inventory_id>/invite/', ...)
    """

    def has_permission(self, request, view):
        inventory_id = view.kwargs.get("inventory_id")

        if not inventory_id:
            return False

        try:
            inventory = Inventory.objects.get(id=inventory_id)
        except Inventory.DoesNotExist:
            raise NotFound(
                "Permission denied: Inventory was not found."
            ) from None

        return inventory.is_owner(request.user)


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
