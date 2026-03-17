from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer

DELETE_ITEM_RESPONSES = {
    204: OpenApiResponse(
        response=None,
        description="Item Deleted",
    ),
    404: OpenApiResponse(
        response=ErrorResponseSerializer, description="Item not found"
    ),
    401: OpenApiResponse(
        response=None,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer, description="Permission denied"
    ),
}
