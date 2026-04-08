from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.user.serializers.auth0 import (
    Auth0ResponseSerializer,
    Auth0ValidationErrorSerializer,
)

AUTH0_RESPONSES = {
    200: Auth0ResponseSerializer,
    400: OpenApiResponse(
        response=Auth0ValidationErrorSerializer,
        description="Validation failed",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Invalid credentials",
    ),
    500: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Internal server error",
    ),
}
