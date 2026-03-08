from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.list_inventory import InventoryListSerializer

LIST_ITEMS_RESPONSES = {
    200: OpenApiResponse(
        response=InventoryListSerializer,
        description="OK",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
    500: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Internal processing error",
    ),
}
