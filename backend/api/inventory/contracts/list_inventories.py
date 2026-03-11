from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.list_inventory import UserInventoryListSerializer

LIST_INVENTORIES_RESPONSES = {
    200: OpenApiResponse(
        response=UserInventoryListSerializer,
        description="OK",
    ),
    401: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Forbidden.",
    ),
}
