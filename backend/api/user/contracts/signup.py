from drf_spectacular.utils import OpenApiResponse

from api.user.serializers.signup import SignupValidationErrorSerializer

SIGNUP_RESPONSES = {
    201: None,
    400: OpenApiResponse(
        response=SignupValidationErrorSerializer,
        description="Validation failed",
    ),
}
