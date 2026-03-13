from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.contracts.remove_member import REMOVE_MEMBER_RESPONSES
from api.inventory.permissions import IsActiveInventoryOwner
from api.inventory.services.remove_member import remove_member


class RemoveMemberView(APIView):
    """
    Removes an employee membership from the active inventory.
    """

    permission_classes = (
        IsAuthenticated,
        IsActiveInventoryOwner,
    )

    @extend_schema(
        responses=REMOVE_MEMBER_RESPONSES,
    )
    def delete(self, request, membership_id):
        inventory = request.active_inventory

        try:
            remove_member(
                request.user,
                inventory,
                membership_id,
            )

        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except LookupError:
            return Response(
                {"detail": "Membership not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"message": "Employee access removed"},
            status=status.HTTP_200_OK,
        )
