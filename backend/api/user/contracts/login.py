from drf_spectacular.utils import OpenApiResponse

from api.user.serializers.common import (
    ErrorResponseSerializer,
)
from api.user.serializers.login import (
    LoginResponseSerializer,
    LoginValidationErrorSerializer,
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
