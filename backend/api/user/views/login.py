import logging
from typing import cast

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import AbstractBaseUser
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.request import Request
from rest_framework.response import Response

from api.user.contracts.login import LOGIN_RESPONSES
from api.user.models import User as UserModel
from api.user.serializers.login import (
    LoginResponseSerializer,
    LoginSerializer,
)

logger = logging.getLogger(__name__)


class LoginView(views.APIView):
    serializer_class = LoginSerializer

    @extend_schema(
        summary="User Login",
        responses=LOGIN_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(serializer.validated_data, dict):
            logger.critical("Serializer validated_data is not a dict")
            return Response(
                {"detail": "Internal processing error."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user: AbstractBaseUser | None = authenticate(
            request._request, username=email, password=password
        )

        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Create Session
        login(request._request, cast(UserModel, user))

        response_data = LoginResponseSerializer({"username": str(user)}).data
        request.session.pop("auth_provider", None)
        request.session.pop("auth0_picture", None)

        return Response(
            response_data,
            status=status.HTTP_200_OK,
        )
