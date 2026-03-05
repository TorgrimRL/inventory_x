import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.contracts.active_inventory import (
    GET_ACTIVE_INVENTORY_RESPONSES,
    SET_ACTIVE_INVENTORY_RESPONSES,
)
from api.inventory.models import InventoryMembership
from api.inventory.serializers.active_inventory import (
    ActiveInventoryResponseSerializer,
    SetActiveInventoryRequestSerializer,
)

logger = logging.getLogger(__name__)


class ActiveInventoryView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses=GET_ACTIVE_INVENTORY_RESPONSES)
    def get(self, request: Request) -> Response:
        inv_id = request.session.get(SESSION_ACTIVE_INVENTORY_KEY)
        if not inv_id:
            return Response(status=status.HTTP_204_NO_CONTENT)

        membership = (
            InventoryMembership.objects.select_related("inventory")
            .filter(user=request.user, inventory_id=inv_id)
            .first()
        )
        if not membership:
            request.session.pop(SESSION_ACTIVE_INVENTORY_KEY, None)
            return Response(status=status.HTTP_204_NO_CONTENT)

        payload = {
            "id": membership.inventory.id,
            "name": membership.inventory.name,
            "orgNumber": membership.inventory.org_number,
            "role": membership.role,
        }
        return Response(
            ActiveInventoryResponseSerializer(payload).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=SetActiveInventoryRequestSerializer,
        responses=SET_ACTIVE_INVENTORY_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        serializer = SetActiveInventoryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inv_id = serializer.validated_data["inventory_id"]

        membership = (
            InventoryMembership.objects.select_related("inventory")
            .filter(user=request.user, inventory_id=inv_id)
            .first()
        )
        if not membership:
            return Response(
                {"detail": "User is not a member of this inventory"},
                status=status.HTTP_403_FORBIDDEN,
            )

        request.session[SESSION_ACTIVE_INVENTORY_KEY] = str(inv_id)

        payload = {
            "id": membership.inventory.id,
            "name": membership.inventory.name,
            "orgNumber": membership.inventory.org_number,
            "role": membership.role,
        }
        return Response(
            ActiveInventoryResponseSerializer(payload).data,
            status=status.HTTP_200_OK,
        )
