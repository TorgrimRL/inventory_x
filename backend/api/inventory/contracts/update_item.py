from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)
from api.inventory.serializers.create_item import InventoryItemCreateSerializer

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
