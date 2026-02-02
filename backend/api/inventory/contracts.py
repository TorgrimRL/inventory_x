from drf_spectacular.utils import OpenApiResponse

from api.inventory.serializers import AdjustStockResponseSerializer
from api.user.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)

ADJUST_STOCK_RESPONSES = {
    200: AdjustStockResponseSerializer,
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
        description="Validation failed",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Item not found",
    ),
}
