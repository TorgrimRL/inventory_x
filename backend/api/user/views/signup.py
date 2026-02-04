import logging
from typing import Any, cast

from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from api.user.contracts.signup import SIGNUP_RESPONSES
from api.user.serializers.signup import (
    SignupSerializer,
)

logger = logging.getLogger(__name__)


class SignupView(views.APIView):
    serializer_class = SignupSerializer
    permission_classes = (AllowAny,)

    @extend_schema(
        summary="User Signup",
        responses=SIGNUP_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            errors = cast(dict[str, Any], serializer.errors)
            return Response(
                {"detail": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer.save()

        return Response(
            status=status.HTTP_201_CREATED,
        )
