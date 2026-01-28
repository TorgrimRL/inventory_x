from django.core.exceptions import ValidationError as DjangoValidationError
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from . import services
from .serializers import (
    RegisterInventoryRequestSerializer,
)


@api_view(["GET"])
def inventory_list(request):
    data = services.get_all_items()
    return Response({"data": data})


def _map_errors(errors: dict) -> dict:
    if "org_number" in errors and "orgNumber" not in errors:
        errors = dict(errors)
        errors["orgNumber"] = errors.pop("org_number")
    return errors


@extend_schema(request=RegisterInventoryRequestSerializer)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_inventory_view(request):
    s = RegisterInventoryRequestSerializer(data=request.data)
    s.is_valid(raise_exception=True)

    try:
        inventory, _ = services.register_inventory(
            user=request.user,
            name=s.validated_data["name"],
            org_number=s.validated_data["orgNumber"],
        )
    except services.InventoryAlreadyExistsError as e:
        return Response(
            {"errors": {"orgNumber": str(e)}},
            status=status.HTTP_400_BAD_REQUEST,
        )
    except DjangoValidationError as e:
        errs = getattr(e, "message_dict", {"detail": e.messages})
        return Response(
            {"errors": _map_errors(errs)}, status=status.HTTP_400_BAD_REQUEST
        )

    return Response(
        {"message": "Inventory registered", "id": str(inventory.id)},
        status=status.HTTP_201_CREATED,
    )
