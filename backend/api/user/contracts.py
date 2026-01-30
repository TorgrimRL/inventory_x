from drf_spectacular.utils import OpenApiResponse

from api.user.serializers import (
    ErrorResponseSerializer,
    LoginResponseSerializer,
    LoginValidationErrorSerializer,
    LogoutResSerializer,
    VerifySessionResponseSerializer,
)

LOGIN_RESPONSES = {
    200: LoginResponseSerializer,
    400: OpenApiResponse(
        response=LoginValidationErrorSerializer,
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

LOGOUT_RESPONSES = {
    200: LogoutResSerializer,
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Not a authenticated user",
    ),
}
