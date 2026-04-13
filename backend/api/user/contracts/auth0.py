from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.user.serializers.auth0 import (
    Auth0ValidationErrorSerializer,
)

AUTH0_RESPONSES = {
    302: OpenApiResponse(description="Redirect to frontend after successful login"),
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
