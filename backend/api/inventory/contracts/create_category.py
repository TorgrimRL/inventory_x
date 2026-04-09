from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)
from api.inventory.serializers.category import CategorySerializer

CREATE_CATEGORY_RESPONSES = {
    201: OpenApiResponse(
        response=CategorySerializer,
        description="Category created",
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
        description="Permission denied",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
}
