from uuid import UUID

from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.context import get_active_membership_or_raise
from api.inventory.contracts.delete_item import DELETE_ITEM_RESPONSES
from api.inventory.contracts.update_item import UPDATE_ITEM_RESPONSES
from api.inventory.permissions import IsActiveInventoryOwner
from api.inventory.serializers.update_item import InventoryItemUpdateSerializer
from api.inventory.services.items import delete_item, update_item


class ItemDetailView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)
    serializer_class = InventoryItemUpdateSerializer

    @extend_schema(
        summary="Update item details",
        responses=UPDATE_ITEM_RESPONSES,
    )
    def patch(self, request: Request, item_id: UUID) -> Response:
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = update_item(
                item_id=item_id,
                name=serializer.validated_data["name"],
                price=serializer.validated_data["price"],
                request=request,
            )
        except LookupError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "id": item.id,
                "name": item.name,
                "price": item.price,
                "stock": item.stock,
                "message": "Item updated",
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(responses=DELETE_ITEM_RESPONSES)
    def delete(
        self, request: Request, item_id: UUID, *args, **kwargs
    ) -> Response:
        """
        Delete an item using the active inventory context.
        """
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
