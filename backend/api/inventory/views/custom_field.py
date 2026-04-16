from uuid import UUID

from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.context import get_active_membership_or_raise
from api.inventory.contracts.custom_field import (
    CREATE_CUSTOM_FIELD_RESPONSES,
    DELETE_CUSTOM_FIELD_RESPONSES,
    GET_CUSTOM_FIELDS_RESPONSES,
)
from api.inventory.models import InventoryCustomField
from api.inventory.permissions import IsActiveInventoryOwner
from api.inventory.serializers.custom_field import (
    InventoryCustomFieldSerializer,
)


class CustomFieldListView(views.APIView):
    serializer_class = InventoryCustomFieldSerializer

    def get_permissions(self) -> list:
        """
        Dynamically assign permissions:
        - GET: Any authenticated member (active inventory context handles
               membership check).
        - POST: Strictly restricted to active inventory owners.
        """
        if self.request.method == "POST":
            return [IsAuthenticated(), IsActiveInventoryOwner()]
        return [IsAuthenticated()]

    @extend_schema(
        summary="List custom fields for active inventory",
        responses=GET_CUSTOM_FIELDS_RESPONSES,
    )
    def get(self, request: Request) -> Response:
        membership = get_active_membership_or_raise(request)
        inventory = membership.inventory

        fields = InventoryCustomField.objects.filter(inventory=inventory)
        serializer = self.serializer_class(fields, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create a custom field for active inventory",
        responses=CREATE_CUSTOM_FIELD_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        membership = get_active_membership_or_raise(request)
        inventory = membership.inventory

        serializer = self.serializer_class(data=request.data)

        serializer.is_valid(raise_exception=True)
        serializer.save(inventory=inventory)

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CustomFieldDetailView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)

    @extend_schema(
        summary="Delete a custom field",
        responses=DELETE_CUSTOM_FIELD_RESPONSES,
    )
    def delete(self, request: Request, field_id: UUID) -> Response:
        membership = get_active_membership_or_raise(request)
        inventory = membership.inventory

        try:
            field = InventoryCustomField.objects.get(
                id=field_id, inventory=inventory
            )
        except InventoryCustomField.DoesNotExist:
            return Response(
                {"detail": "Custom field not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        field.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
