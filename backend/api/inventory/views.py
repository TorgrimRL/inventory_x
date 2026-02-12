import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory import services
from api.inventory.contracts import (
    ADJUST_STOCK_RESPONSES,
    UPDATE_ITEM_RESPONSES,
)
from api.inventory.serializers import (
    AdjustStockSerializer,
    InventoryItemCreateSerializer,
    InventoryItemUpdateSerializer,
)

from .contracts import (
    CREATE_ITEM_RESPONSES,
    LIST_ITEMS_RESPONSES,
    REGISTER_INVENTORY_RESPONSES,
)
from .models import Inventory, InventoryAlreadyExistsError
from .serializers import (
    RegisterInventoryRequestSerializer,
    RegisterInventoryResponseSerializer,
)

logger = logging.getLogger(__name__)


class InventoryView(APIView):
    serializer_class = InventoryItemCreateSerializer

    @extend_schema(responses=LIST_ITEMS_RESPONSES)
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
            name = serializer.validated_data["name"]
            price = serializer.validated_data["price"]
            stock = serializer.validated_data.get("stock", 0)

            # Attempt to create the item
            created = services.create_item(name=name, price=price, stock=stock)
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


class AdjustStockView(APIView):
    serializer_class = AdjustStockSerializer

    @extend_schema(
        summary="Adjust item stock",
        responses=ADJUST_STOCK_RESPONSES,
    )
    def post(self, request: Request, item_id: int) -> Response:
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = services.adjust_stock(
                item_id=item_id,
                direction=serializer.validated_data["direction"],
                amount=serializer.validated_data["amount"],
            )
        except LookupError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        except ValueError as exc:
            return Response(
                {"detail": {"non_field_errors": [str(exc)]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "item_id": item.id,
                "stock": item.stock,
                "message": "Stock updated",
            },
            status=status.HTTP_200_OK,
        )


class RegisterInventoryView(views.APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = RegisterInventoryRequestSerializer

    @extend_schema(
        responses=REGISTER_INVENTORY_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data

        try:
            inventory, _ = Inventory.register_with_owner(
                user=request.user,
                name=data["name"],
                org_number=data["orgNumber"],
            )
        except InventoryAlreadyExistsError as e:
            return Response(
                {"detail": {"orgNumber": [str(e)]}},
                status=status.HTTP_409_CONFLICT,
            )
        except DjangoValidationError as e:
            errs = getattr(e, "message_dict", {"detail": e.messages})
            errs = self._map_errors(errs)
            errs = self._ensure_list_values(errs)
            return Response(
                {"detail": errs}, status=status.HTTP_400_BAD_REQUEST
            )

        response_data = RegisterInventoryResponseSerializer(
            {"message": "Inventory registered", "id": inventory.id}
        ).data
        return Response(response_data, status=status.HTTP_201_CREATED)

    @staticmethod
    def _map_errors(errors: dict) -> dict:
        if "org_number" in errors and "orgNumber" not in errors:
            errors = dict(errors)
            errors["orgNumber"] = errors.pop("org_number")
        return errors

    @staticmethod
    def _ensure_list_values(errors: dict) -> dict:
        fixed = {}
        for key, value in (errors or {}).items():
            fixed[key] = value if isinstance(value, list) else [str(value)]
        return fixed


class UpdateItemView(views.APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = InventoryItemUpdateSerializer

    @extend_schema(
        summary="Update item details",
        responses=UPDATE_ITEM_RESPONSES,
    )
    def patch(self, request: Request, item_id: int) -> Response:
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = services.update_item(
                item_id=item_id,
                name=serializer.validated_data["name"],
                price=serializer.validated_data["price"],
            )
        except LookupError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValueError as exc:
            return Response(
                {"detail": {"name": [str(exc)]}}, 
                status=status.HTTP_400_BAD_REQUEST,
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
