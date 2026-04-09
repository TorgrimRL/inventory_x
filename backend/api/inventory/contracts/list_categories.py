from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.category import CategorySerializer

LIST_CATEGORIES_RESPONSES = {
    200: OpenApiResponse(
        response=CategorySerializer(many=True),
        description="List of categories",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Permission denied",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
}
