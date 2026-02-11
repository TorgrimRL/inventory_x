from drf_spectacular.utils import OpenApiResponse

from api.user.serializers.logout import LogoutResSerializer

LOGOUT_RESPONSES = {
    200: OpenApiResponse(
        description="Successfully logged out",
        response=LogoutResSerializer,
    ),
    403: OpenApiResponse(
        response=LogoutResSerializer,
        description="Unauthorized",
    ),
}
