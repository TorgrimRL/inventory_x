import logging

from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory.contracts.invite_user import INVITE_USER_RESPONSES
from api.inventory.permissions import IsInventoryOwner
from api.inventory.serializers.invite_user import InviteUserRequestSerializer
from api.inventory.services.invite_user import invite_user

logger = logging.getLogger(__name__)


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
            invite_user(
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
