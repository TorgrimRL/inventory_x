from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer

REMOVE_MEMBER_RESPONSES = {
    200: OpenApiResponse(
        response=None,
        description="Employee access removed",
    ),
    400: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Invalid membership removal",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Forbidden",
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Membership not found",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
}
