from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer

DELETE_CATEGORY_RESPONSES = {
    204: OpenApiResponse(
        response=None,
        description="Category Deleted",
    ),
    401: OpenApiResponse(
        response=None,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Permission denied",
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Category not found",
    ),
}
