import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.context import get_request_active_membership
from api.inventory.contracts.create_item import CREATE_ITEM_RESPONSES
from api.inventory.contracts.list_items import LIST_ITEMS_RESPONSES
from api.inventory.permissions import IsActiveInventoryMember
from api.inventory.serializers.create_item import InventoryItemCreateSerializer
from api.inventory.services.items import create_item, get_all_items

logger = logging.getLogger(__name__)


class InventoryView(APIView):
    serializer_class = InventoryItemCreateSerializer
    permission_classes = (IsAuthenticated, IsActiveInventoryMember)

    @extend_schema(responses=LIST_ITEMS_RESPONSES)
    def get(self, request: Request) -> Response:
        try:
            membership = get_request_active_membership(request)
            data = get_all_items(inventory_id=membership.inventory.id)
            return Response({"data": data}, status=status.HTTP_200_OK)
        except APIException:
            raise
        except Exception as e:
            logger.error(f"Failed to fetch inventory items: {e!s}")
            return Response(
                {"detail": "Internal processing error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses=CREATE_ITEM_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Invalid data provided: {serializer.errors}")
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = get_request_active_membership(request)
            name = serializer.validated_data["name"]
            price = serializer.validated_data["price"]
            stock = serializer.validated_data.get("stock", 0)

            # Attempt to create the item
            created = create_item(
                inventory_id=membership.inventory.id,
                name=name,
                price=price,
                stock=stock,
                request=request,
            )
            return Response(created, status=status.HTTP_201_CREATED)

        except ValueError as e:
            # Specific business validation error (e.g., duplicate item name)
            logger.warning(f"Business validation failed: {e!s}")
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            # General error handling for any unexpected issues
            logger.exception(f"Failed to create inventory item: {e!s}")
            return Response(
                {"detail": "Internal processing error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
