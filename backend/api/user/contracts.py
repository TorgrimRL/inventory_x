from drf_spectacular.utils import OpenApiResponse

from api.user.serializers import (
    ErrorResponseSerializer,
    LoginResponseSerializer,
    ValidationErrorResponseSerializer,
    VerifySessionResponseSerializer,
)

LOGIN_RESPONSES = {
    200: LoginResponseSerializer,
    400: OpenApiResponse(
        response=ValidationErrorResponseSerializer,
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

VERIFY_RESPONSES = {
    200: VerifySessionResponseSerializer,
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication credentials were not provided.",
    ),
}
