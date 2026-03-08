from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)
from api.inventory.serializers.active_inventory import (
    ActiveInventoryResponseSerializer,
)

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
