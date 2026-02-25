from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiResponse,
)

PASSOWORD_RESET_RESPONSES = {
    200: OpenApiResponse(
        description="OTC sent (or ignored silently if email is missing from DB\
        for security)"
    ),
    400: OpenApiResponse(
        description="Bad Request: Missing 'email' query parameter."
    ),
}

PASSWORD_RESET_PARAMS = [
    OpenApiParameter(
        name="email",
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description="User email to send the reset OTC to",
        required=False,
    ),
]
