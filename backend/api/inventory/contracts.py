from drf_spectacular.utils import OpenApiResponse

from api.inventory.serializers import (
    AdjustStockResponseSerializer,
    InventoryItemCreateSerializer,
    RegisterInventoryResponseSerializer,
    RegisterInventoryValidationErrorSerializer,
)
from api.user.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)

REGISTER_INVENTORY_RESPONSES = {
    201: OpenApiResponse(
        description="Inventory & membership registered",
        response=RegisterInventoryResponseSerializer,
    ),
    400: OpenApiResponse(
        description="Validation failed",
        response=RegisterInventoryValidationErrorSerializer,
    ),
    401: OpenApiResponse(
        description="Authentication credentials were not provided.",
        response=ErrorResponseSerializer,
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Forbidden.",
    ),
    409: OpenApiResponse(
        description="Inventory with the same name already exists",
        response=RegisterInventoryValidationErrorSerializer,
    ),
}

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

CREATE_ITEM_RESPONSES = {
    201: OpenApiResponse(
        response=InventoryItemCreateSerializer,
        description="Item created",
    ),
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
        description="Validation failed",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
}
