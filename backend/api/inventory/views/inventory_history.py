from datetime import datetime

from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.context import get_request_active_membership
from api.inventory.contracts.inventory_history import (
    INVENTORY_HISTORY_RESPONSES,
)
from api.inventory.models import StockLog
from api.inventory.permissions import IsActiveInventoryMember


class InventoryHistoryView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryMember)

    @extend_schema(
        summary="Get monthly inventory value history for active inventory",
        responses=INVENTORY_HISTORY_RESPONSES,
    )
    def get(self, request: Request) -> Response:
        membership = get_request_active_membership(request)
        year = int(request.query_params.get("year", datetime.now().year))

        logs = (
            StockLog.objects.filter(item__inventory_id=membership.inventory.id)
            .exclude(current_stock__isnull=True)
            .exclude(price__isnull=True)
            .order_by("timestamp")
        )

        latest_by_item_and_month: dict[tuple[str, int], StockLog] = {}
        latest_before_year: dict[str, StockLog] = {}

        for log in logs:
            item_id = str(log.item_id)
            month_key = (item_id, log.timestamp.month)

            if log.timestamp.year < year:
                latest_before_year[item_id] = log
                continue

            if log.timestamp.year == year:
                latest_by_item_and_month[month_key] = log

        running_values = {
            item_id: int(log.current_stock or 0) * int(log.price or 0)
            for item_id, log in latest_before_year.items()
        }

        response = []
        month_labels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        for month_index, label in enumerate(month_labels, start=1):
            for (item_id, log_month), log in latest_by_item_and_month.items():
                if log_month == month_index:
                    running_values[item_id] = int(log.current_stock or 0) * int(
                        log.price or 0
                    )

            response.append(
                {
                    "month": label,
                    "value": sum(running_values.values()),
                }
            )

        return Response(response, status=status.HTTP_200_OK)
