import logging
from uuid import UUID

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.context import get_request_active_membership
from api.inventory.contracts.adjust_stock import ADJUST_STOCK_RESPONSES
from api.inventory.permissions import IsActiveInventoryMember
from api.inventory.serializers.adjust_stock import AdjustStockSerializer
from api.inventory.services.items import adjust_stock

logger = logging.getLogger(__name__)


class AdjustStockView(APIView):
    serializer_class = AdjustStockSerializer
    permission_classes = (IsAuthenticated, IsActiveInventoryMember)

    @extend_schema(
        summary="Adjust item stock",
        responses=ADJUST_STOCK_RESPONSES,
    )
    def post(self, request: Request, item_id: UUID) -> Response:
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = get_request_active_membership(request)
            item = adjust_stock(
                inventory_id=membership.inventory.id,
                item_id=item_id,
                direction=serializer.validated_data["direction"],
                amount=serializer.validated_data["amount"],
            )
        except LookupError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValueError as exc:
            return Response(
                {"detail": {"non_field_errors": [str(exc)]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "item_id": item.id,
                "stock": item.stock,
                "message": "Stock updated",
            },
            status=status.HTTP_200_OK,
        )
