from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)
from api.inventory.serializers.adjust_stock import AdjustStockResponseSerializer

ADJUST_STOCK_RESPONSES = {
    200: AdjustStockResponseSerializer,
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
        description="Validation failed",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Item not found",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
}
