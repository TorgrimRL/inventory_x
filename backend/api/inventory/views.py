import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.exceptions import APIException
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory import services
from api.inventory.contracts import (
    ADJUST_STOCK_RESPONSES,
    GET_ACTIVE_INVENTORY_RESPONSES,
    INVITE_USER_RESPONSES,
    LIST_INVENTORIES_RESPONSES,
    UPDATE_ITEM_RESPONSES,
    SET_ACTIVE_INVENTORY_RESPONSES,
)
from api.inventory.serializers import (
    ActiveInventoryResponseSerializer,
    AdjustStockSerializer,
    InventoryItemCreateSerializer,
    InventoryItemUpdateSerializer,
    InviteUserRequestSerializer,
    SetActiveInventoryRequestSerializer,
    UserInventoryListItemSerializer,
)

from .context import SESSION_ACTIVE_INVENTORY_KEY, get_request_active_membership
from .contracts import (
    CREATE_ITEM_RESPONSES,
    LIST_ITEMS_RESPONSES,
    REGISTER_INVENTORY_RESPONSES,
)
from .models import Inventory, InventoryAlreadyExistsError, InventoryMembership
from .permissions import IsActiveInventoryMember, IsInventoryOwner
from .serializers import (
    RegisterInventoryRequestSerializer,
    RegisterInventoryResponseSerializer,
)

logger = logging.getLogger(__name__)


class InventoryView(APIView):
    serializer_class = InventoryItemCreateSerializer
    permission_classes = (IsAuthenticated, IsActiveInventoryMember)

    @extend_schema(responses=LIST_ITEMS_RESPONSES)
    def get(self, request: Request) -> Response:
        try:
            membership = get_request_active_membership(request)
            data = services.get_all_items(inventory_id=membership.inventory.id)
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
            created = services.create_item(
                inventory_id=membership.inventory.id,
                name=name,
                price=price,
                stock=stock,
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


class AdjustStockView(APIView):
    serializer_class = AdjustStockSerializer
    permission_classes = (IsAuthenticated, IsActiveInventoryMember)

    @extend_schema(
        summary="Adjust item stock",
        responses=ADJUST_STOCK_RESPONSES,
    )
    def post(self, request: Request, item_id: int) -> Response:
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            membership = get_request_active_membership(request)
            item = services.adjust_stock(
                inventory_id=membership.inventory.id,
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
        is_owner = InventoryMembership.objects.filter(
            user=request.user,
            role=InventoryMembership.Role.OWNER,
        ).exists()

        if not is_owner:
            return Response(
                {"detail": "Only the owner can edit name and price."},
                status=status.HTTP_403_FORBIDDEN,
            )

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


class ListInventoriesView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses=LIST_INVENTORIES_RESPONSES)
    def get(self, request: Request) -> Response:
        qs = (
            InventoryMembership.objects.filter(user=request.user)
            .select_related("inventory")
            .order_by("inventory__name")
        )
        data = UserInventoryListItemSerializer(qs, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class InviteUserView(APIView):
    permission_classes = (
        IsAuthenticated,
        IsInventoryOwner,
    )
    serializer_class = InviteUserRequestSerializer

    @extend_schema(
        summary="Invite user to inventory",
        responses=INVITE_USER_RESPONSES,
    )
    def post(self, request: Request, inventory_id: str) -> Response:
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            services.invite_user(
                requestor=request.user,
                inventory_id=inventory_id,
                target_email=serializer.validated_data["email"],
            )
            return Response(status=status.HTTP_200_OK)

        except PermissionError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_403_FORBIDDEN
            )

        except ValueError as e:
            return Response(
                {"detail": {"non_field_errors": [str(e)]}},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ActiveInventoryView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(responses=GET_ACTIVE_INVENTORY_RESPONSES)
    def get(self, request: Request) -> Response:
        inv_id = request.session.get(SESSION_ACTIVE_INVENTORY_KEY)
        if not inv_id:
            return Response(status=status.HTTP_204_NO_CONTENT)

        membership = (
            InventoryMembership.objects.select_related("inventory")
            .filter(user=request.user, inventory_id=inv_id)
            .first()
        )
        if not membership:
            request.session.pop(SESSION_ACTIVE_INVENTORY_KEY, None)
            return Response(status=status.HTTP_204_NO_CONTENT)

        payload = {
            "id": membership.inventory.id,
            "name": membership.inventory.name,
            "orgNumber": membership.inventory.org_number,
            "role": membership.role,
        }
        return Response(
            ActiveInventoryResponseSerializer(payload).data,
            status=status.HTTP_200_OK,
        )

    @extend_schema(
        request=SetActiveInventoryRequestSerializer,
        responses=SET_ACTIVE_INVENTORY_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        serializer = SetActiveInventoryRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        inv_id = serializer.validated_data["inventory_id"]

        membership = (
            InventoryMembership.objects.select_related("inventory")
            .filter(user=request.user, inventory_id=inv_id)
            .first()
        )
        if not membership:
            return Response(
                {"detail": "User is not a member of this inventory"},
                status=status.HTTP_403_FORBIDDEN,
            )

        request.session[SESSION_ACTIVE_INVENTORY_KEY] = str(inv_id)

        payload = {
            "id": membership.inventory.id,
            "name": membership.inventory.name,
            "orgNumber": membership.inventory.org_number,
            "role": membership.role,
        }
        return Response(
            ActiveInventoryResponseSerializer(payload).data,
            status=status.HTTP_200_OK,
        )
