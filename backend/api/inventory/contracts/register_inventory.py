from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.register_inventory import (
    RegisterInventoryResponseSerializer,
    RegisterInventoryValidationErrorSerializer,
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
