from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.inventory_member import (
    InventoryMemberSerializer,
)

LIST_MEMBERS_RESPONSES = {
    200: OpenApiResponse(
        response=InventoryMemberSerializer(many=True),
        description="List of members in the active inventory",
    ),
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication required or forbidden",
    ),
    409: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="No active inventory selected",
    ),
}
