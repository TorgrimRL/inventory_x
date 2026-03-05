from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)
from api.inventory.serializers.create_item import InventoryItemCreateSerializer
from api.inventory.serializers.list_inventory import InventoryListSerializer

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
