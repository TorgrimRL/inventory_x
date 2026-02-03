from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from . import services
from .contracts import REGISTER_INVENTORY_RESPONSES
from .models import InventoryAlreadyExistsError
from .serializers import (
    RegisterInventoryRequestSerializer,
    RegisterInventoryResponseSerializer,
)


@api_view(["GET"])
def inventory_list(request):
    data = services.get_all_items()
    return Response({"data": data})


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
            inventory, _ = services.register_inventory(
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
