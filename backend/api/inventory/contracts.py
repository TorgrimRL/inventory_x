from drf_spectacular.utils import OpenApiResponse

from api.inventory.serializers import (
    ActiveInventoryResponseSerializer,
    AdjustStockResponseSerializer,
    InventoryItemCreateSerializer,
    InventoryListSerializer,
    RegisterInventoryResponseSerializer,
    RegisterInventoryValidationErrorSerializer,
    UserInventoryListSerializer,
)
from api.user.serializers.common import (
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

CREATE_ITEM_RESPONSES = {
    200: OpenApiResponse(
        response=InventoryListSerializer,
        description="OK",
    ),
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
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
}

LIST_ITEMS_RESPONSES = {
    200: OpenApiResponse(
        response=InventoryListSerializer,
        description="OK",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
    500: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Internal processing error",
    ),
}

LIST_INVENTORIES_RESPONSES = {
    200: OpenApiResponse(
        response=UserInventoryListSerializer,
        description="OK",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Forbidden.",
    ),
}

UPDATE_ITEM_RESPONSES = {
    200: OpenApiResponse(
        response=InventoryItemCreateSerializer,
        description="Item updated successfully",
    ),
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
        description="Validation failed",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication credentials were not provided.",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Forbidden.",
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Item not found",
    ),
}

INVITE_USER_RESPONSES = {
    200: OpenApiResponse(
        response=None,
    ),
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer,
    ),
}

GET_ACTIVE_INVENTORY_RESPONSES = {
    200: OpenApiResponse(
        response=ActiveInventoryResponseSerializer,
        description="OK",
    ),
    204: OpenApiResponse(
        response=None,
        description="No active inventory found",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Forbidden",
    ),
}
SET_ACTIVE_INVENTORY_RESPONSES = {
    200: OpenApiResponse(
        response=ActiveInventoryResponseSerializer,
        description="Active inventory set",
    ),
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
        description="Validation failed",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="User is not a member of this inventory.",
    ),
}
