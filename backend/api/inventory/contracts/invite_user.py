from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import (
    ErrorResponseSerializer,
    ValidationErrorResponseSerializer,
)

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
    409: OpenApiResponse(
        description="Inventory with the same name already exists",
        response=ErrorResponseSerializer,
    ),
}
