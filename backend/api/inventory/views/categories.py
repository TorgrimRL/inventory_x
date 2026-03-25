from uuid import UUID

from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.context import get_active_membership_or_raise
from api.inventory.contracts.create_category import CREATE_CATEGORY_RESPONSES
from api.inventory.contracts.delete_category import DELETE_CATEGORY_RESPONSES
from api.inventory.contracts.list_categories import LIST_CATEGORIES_RESPONSES
from api.inventory.permissions import (
    IsActiveInventoryOwner,
)
from api.inventory.serializers.category import CategorySerializer
from api.inventory.services.categories import (
    create_category,
    delete_category,
    get_all_categories,
)


class CategoryView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)

    @extend_schema(
        summary="List categories",
        responses=LIST_CATEGORIES_RESPONSES,
    )
    def get(self, request: Request) -> Response:
        membership = get_active_membership_or_raise(request)
        categories = get_all_categories(membership.inventory.id)
        return Response(categories, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create a new category",
        request=CategorySerializer,
        responses=CREATE_CATEGORY_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        membership = get_active_membership_or_raise(request)
        serializer = CategorySerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            category = create_category(
                inventory_id=membership.inventory.id,
                name=serializer.validated_data["name"],
            )
            return Response(category, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response(
                {"detail": {"non_field_errors": [str(e)]}},
                status=status.HTTP_400_BAD_REQUEST,
            )


class CategoryDetailView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)

    @extend_schema(
        summary="Delete a category",
        responses=DELETE_CATEGORY_RESPONSES,
    )
    def delete(self, request: Request, category_id: UUID) -> Response:
        membership = get_active_membership_or_raise(request)
        try:
            delete_category(
                inventory_id=membership.inventory.id, category_id=category_id
            )
            return Response(status=status.HTTP_204_NO_CONTENT)
        except LookupError as e:
            return Response(
                {"detail": str(e)}, status=status.HTTP_404_NOT_FOUND
            )
