from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.stock_log import (
    StockLogSerializerList,
)
from api.user.contracts.password_reset import OpenApiResponse

STOCK_LOG_RESPONSES = {
    200: OpenApiResponse(
        response=StockLogSerializerList,
        description="Successfully retrieved the stock logs list for the item.",
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
