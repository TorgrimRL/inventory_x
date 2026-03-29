from uuid import UUID

from drf_spectacular.utils import extend_schema
from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.contracts.stock_log import STOCK_LOG_RESPONSES
from api.inventory.models import StockLog
from api.inventory.permissions import IsActiveInventoryMember
from api.inventory.serializers.stock_log import StockLogSerializer
from api.user.contracts.password_reset import (
    OpenApiParameter,
    OpenApiTypes,
)


class StockLogView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryMember)

    @extend_schema(
        summary="Get stock logs for a specific item",
        parameters=[
            OpenApiParameter(
                name="item_id",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.PATH,
                description="The ID of the item to retrieve logs for",
            ),
        ],
        responses=STOCK_LOG_RESPONSES,
    )
    def get(self, _req: Request, item_id: UUID) -> Response:
        logs = StockLog.objects.filter(item_id=item_id)
        serializer = StockLogSerializer(logs, many=True)

        return Response(serializer.data)
