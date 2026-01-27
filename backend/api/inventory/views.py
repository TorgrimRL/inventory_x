import logging

from rest_framework import serializers, status, views
from rest_framework.request import Request
from rest_framework.response import Response

from . import services

logger = logging.getLogger(__name__)


class InventoryItemCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    price = serializers.IntegerField(min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)


class InventoryView(views.APIView):
    serializer_class = InventoryItemCreateSerializer

    def get(self, request: Request) -> Response:
        try:
            data = services.get_all_items()
            return Response({"data": data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Failed to fetch inventory items: {e!s}")
            return Response(
                {"detail": "Internal processing error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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
            name = serializer.validated_data["name"]
            price = serializer.validated_data["price"]
            stock = serializer.validated_data.get("stock", 0)

            # Attempt to create the item
            created = services.create_item(name=name, price=price, stock=stock)
            return Response(
                {"data": created},
                status=status.HTTP_201_CREATED,
            )
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
