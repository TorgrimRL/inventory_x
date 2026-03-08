from uuid import UUID

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.models import Inventory, InventoryMembership
from api.inventory.permissions import IsActiveInventoryOwner
from api.inventory.serializers.inventory_member import InventoryMemberSerializer


class ListMembersView(APIView):
    """
    Returns all members of the active inventory.
    """

    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)

    def get(self, request):
        inventory_id = request.session.get(SESSION_ACTIVE_INVENTORY_KEY)

        if not inventory_id:
            return Response(
                {"detail": "No active inventory selected"},
                status=status.HTTP_409_CONFLICT,
            )

        try:
            inventory = Inventory.objects.get(id=UUID(inventory_id))
        except (Inventory.DoesNotExist, ValueError):
            return Response(
                {"detail": "No active inventory selected"},
                status=status.HTTP_409_CONFLICT,
            )

        has_access = InventoryMembership.objects.filter(
            inventory=inventory,
            user=request.user,
        ).exists()

        if not has_access:
            request.session.pop(SESSION_ACTIVE_INVENTORY_KEY, None)
            return Response(
                {"detail": "No active inventory selected"},
                status=status.HTTP_409_CONFLICT,
            )

        memberships = (
            InventoryMembership.objects.filter(inventory=inventory)
            .select_related("user")
            .order_by("role", "user__email")
        )

        serializer = InventoryMemberSerializer(memberships, many=True)
        return Response(serializer.data)
