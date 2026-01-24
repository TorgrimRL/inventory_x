# login.py
import logging
from typing import cast

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import AbstractBaseUser
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

from api.user.models import User

logger = logging.getLogger(__name__)


@api_view(["POST"])
def login_handler(request: Request) -> Response:
    email: str | None = request.data.get("email")
    password: str | None = request.data.get("password")

    # User authentifier
    user: AbstractBaseUser | None = authenticate(
        request, username=email, password=password
    )

    if user is None:
        logger.warning(f"Failed login attempt for email: {email}")
        return Response(
            {"error": "Invalid credentials"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    # CREATE SESSION
    # Cookies will be include in HTTP Response header.
    login(request, cast(User, user))

    logger.info(f"User {user.get_username()} logged in successfully.")
    return Response(
        {"status": "success", "display_name": user.get_username()},
        status=status.HTTP_200_OK,
    )


# @api_view(["POST"])
# def logout_handler(request):
#     logout(request)
#     return Response({"status": "logged out"})
