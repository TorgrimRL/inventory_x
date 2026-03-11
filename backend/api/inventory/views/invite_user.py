import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.contracts.invite_user import INVITE_USER_RESPONSES
from api.inventory.permissions import IsActiveInventoryOwner
from api.inventory.serializers.invite_user import InviteUserRequestSerializer
from api.inventory.services.invite_user import invite_user

logger = logging.getLogger(__name__)


class InviteUserView(APIView):
    permission_classes = (
        IsAuthenticated,
        IsActiveInventoryOwner,
    )
    serializer_class = InviteUserRequestSerializer

    @extend_schema(
        summary="Invite user to inventory",
        responses=INVITE_USER_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        """
        Invites an user to the current active inventory.
        """
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            active_inventory = getattr(request, "active_inventory", None)

            if active_inventory is None:
                return Response(
                    {
                        "detail": "Internal server error: Missing active"
                        "inventory context."
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            invite_user(
                requestor=request.user,
                inventory_id=active_inventory.id,
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
