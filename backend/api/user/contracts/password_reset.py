from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
)

from api.user.serializers.password_reset import (
    PasswordResetValidationErrorSerializer,
)

PASSWORD_RESET_RESPONSES_PUT = {
    200: OpenApiResponse(description="Password updated successfully."),
    400: OpenApiResponse(
        response=PasswordResetValidationErrorSerializer,
        description="Bad Request: Fails validation rules.",
    ),
    404: OpenApiResponse(
        description="Not Found: The OTC is invalid, expired,\
                or the user no longer exists."
    ),
}

PASSWORD_RESET_RESPONSES_POST = {
    200: OpenApiResponse(
        description="OTC sent (or ignored silently if email is missing from DB\
        for security)"
    ),
    400: OpenApiResponse(
        description="Bad Request: Missing 'email' query parameter."
    ),
}

PASSWORD_RESET_PARAMS_POST = [
    OpenApiParameter(
        name="email",
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description="User email to send the reset OTC to",
        required=False,
    ),
]
