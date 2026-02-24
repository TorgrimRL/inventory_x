from rest_framework import permissions

from .context import require_active_membership
from .models import InventoryMembership


class IsActiveInventoryOwner(permissions.BasePermission):
    """
    Grant permission only if the request user is the OWNER of the active
    inventory currently selected in their session.

    NOTE: Caches the associated inventory and memebrship to be used later
    """

    def has_permission(self, request, view):
        membership = require_active_membership(request)

        request.active_inventory = membership.inventory
        request.active_membership = membership

        return membership.role == InventoryMembership.Role.OWNER
