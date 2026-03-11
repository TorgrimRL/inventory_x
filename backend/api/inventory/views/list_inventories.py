import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.contracts.list_inventories import LIST_INVENTORIES_RESPONSES
from api.inventory.models import InventoryMembership
from api.inventory.serializers.list_inventory import (
    UserInventoryListItemSerializer,
)

logger = logging.getLogger(__name__)


class ListInventoriesView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses=LIST_INVENTORIES_RESPONSES)
    def get(self, request: Request) -> Response:
        qs = (
            InventoryMembership.objects.filter(user=request.user)
            .select_related("inventory")
            .order_by("inventory__name")
        )
        data = UserInventoryListItemSerializer(qs, many=True).data
        return Response(data, status=status.HTTP_200_OK)
