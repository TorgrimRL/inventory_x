from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.inventory_history import (
    InventoryHistoryPointSerializer,
)
from api.user.contracts.password_reset import OpenApiResponse

INVENTORY_HISTORY_RESPONSES = {
    200: OpenApiResponse(
        response=InventoryHistoryPointSerializer(many=True),
        description="Successfully retrieved monthly inventory value history.",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication credentials were not provided.",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Conflict: No active inventory selected for the user.",
    ),
}
