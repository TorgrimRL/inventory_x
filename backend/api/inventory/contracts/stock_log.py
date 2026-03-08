from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.stock_log import StockLogSerializer
from api.user.contracts.password_reset import OpenApiResponse

STOCK_LOG_RESPONSES = {
    200: OpenApiResponse(
        response=StockLogSerializer(many=True),
        description="Successfully retrieved the list of stock logs for the item.",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication credentials were not provided.",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Conflict: No active inventory selected for the user.",
    ),
}
