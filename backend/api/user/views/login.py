# Created By Blackh-t
# 2026-01-24
import logging
from typing import cast

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import AbstractBaseUser
from rest_framework import serializers, status, views
from rest_framework.request import Request
from rest_framework.response import Response

from api.user.models import User as UserModel

logger = logging.getLogger(__name__)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class LoginView(views.APIView):
    # load serializers isinstance.
    serializer_class = LoginSerializer

    def post(self, request: Request) -> Response:
        # Parse Requst payload.
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"ERR": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )
        email: str | None = serializer.validated_data["email"]
        password: str | None = serializer.validated_data["password"]

        # Authenticate
        ip = request.META.get("REMOTE_ADDR")
        user: AbstractBaseUser | None = authenticate(
            request, username=email, password=password
        )

        if user is None:
            logger.warning(f"Failed login attempt from: {ip}")
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Create Session
        login(request, cast(UserModel, user))
        logger.info(f"User {user.get_username()} logged in from {ip}")

        return Response(
            {
                "status": "success",
                "username": user.get_username(),
            },
            status=status.HTTP_200_OK,
        )
