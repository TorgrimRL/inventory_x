import logging
from uuid import UUID

from drf_spectacular.utils import extend_schema
from rest_framework import parsers, status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.context import get_active_membership_or_raise
from api.inventory.contracts.delete_item import DELETE_ITEM_RESPONSES
from api.inventory.contracts.update_item import UPDATE_ITEM_RESPONSES
from api.inventory.permissions import IsActiveInventoryOwner
from api.inventory.serializers.update_item import InventoryItemUpdateSerializer
from api.inventory.services.items import delete_item, update_item

logger = logging.getLogger(__name__)


class ItemDetailView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)
    serializer_class = InventoryItemUpdateSerializer
    parser_classes = (
        parsers.JSONParser,
        parsers.MultiPartParser,
        parsers.FormParser,
    )

    @extend_schema(
        summary="Update item details",
        responses=UPDATE_ITEM_RESPONSES,
    )
    def patch(self, request: Request, item_id: UUID) -> Response:
        membership = get_active_membership_or_raise(request)
        serializer = self.serializer_class(
            data=request.data, context={"request": request}, partial=True
        )

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            updated = update_item(
                inventory_id=membership.inventory.id,
                item_id=item_id,
                name=serializer.validated_data.get("name"),
                description=serializer.validated_data.get("description"),
                price=serializer.validated_data.get("price"),
                user=membership.user,
                low_stock_threshold=serializer.validated_data.get(
                    "low_stock_threshold"
                ),
                low_stock_notification=serializer.validated_data.get(
                    "low_stock_notification"
                ),
                category_ids=serializer.validated_data.get("category_ids"),
                custom_fields=serializer.validated_data.get("custom_fields"),
                image=serializer.validated_data.get("image"),
                remove_image=serializer.validated_data.get(
                    "remove_image", False
                ),
            )
            return Response(updated, status=status.HTTP_200_OK)

        except ValueError as e:
            error_msg = str(e)

            if "not found" in error_msg.lower():
                return Response(
                    {"detail": error_msg},
                    status=status.HTTP_404_NOT_FOUND,
                )

            return Response(
                {"detail": {"non_field_errors": [error_msg]}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.exception(f"Failed to update inventory item: {e!s}")
            return Response(
                {"detail": "Internal processing error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(responses=DELETE_ITEM_RESPONSES)
    def delete(
        self, request: Request, item_id: UUID, *args, **kwargs
    ) -> Response:
        try:
            membership = get_active_membership_or_raise(request)

            delete_item(inventory_id=membership.inventory.id, item_id=item_id)
            return Response(status=status.HTTP_204_NO_CONTENT)

        except LookupError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception:
            return Response(
                {"detail": "Internal processing error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
