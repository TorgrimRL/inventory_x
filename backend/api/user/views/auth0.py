import logging
import secrets
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.shortcuts import redirect
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from api.user.contracts.auth0 import AUTH0_RESPONSES
from api.user.serializers.auth0 import Auth0CallbackSerializer

logger = logging.getLogger(__name__)


class Auth0CallbackView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        request=Auth0CallbackSerializer,
        responses=AUTH0_RESPONSES,
    )
    def get(self, request):
        serializer = Auth0CallbackSerializer(data=request.query_params)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        expected_state = request.session.pop("auth0_oauth_state", None)
        received_state = serializer.validated_data["state"]

        if not expected_state or received_state != expected_state:
            return Response(
                {"detail": {"state": ["Invalid state."]}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            auth0_user = exchange_auth0_code(serializer.validated_data["code"])
        except requests.HTTPError as exc:
            auth0_status = getattr(exc.response, "status_code", None)

            if auth0_status is not None and 400 <= auth0_status < 500:
                logger.warning("Auth0 rejected authorization code", exc_info=exc)
                return Response(
                    {"detail": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            logger.exception("Auth0 HTTP error during callback")
            return Response(
                {"detail": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except (requests.RequestException, ValueError):
            logger.exception("Auth0 callback failed")
            return Response(
                {"detail": "Internal server error"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        User = get_user_model()
        user = User.objects.filter(email=auth0_user["email"]).first()

        if user is None:
            user = User(
                email=auth0_user["email"],
                display_name=auth0_user.get("display_name", ""),
            )
            user.set_unusable_password()
            user.save()

        login(request._request, user)
        request.session["auth_provider"] = "auth0"
        request.session["auth0_picture"] = auth0_user.get("picture")

        return redirect(settings.AUTH0_LOGIN_SUCCESS_RETURN_TO)


class Auth0StartView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        state = secrets.token_urlsafe(32)
        request.session["auth0_oauth_state"] = state
        params = {
            "response_type": "code",
            "client_id": settings.AUTH0_CLIENT_ID,
            "redirect_uri": settings.AUTH0_CALLBACK_URL,
            "scope": "openid profile email",
            "connection": "google-oauth2",
            "state": state,
        }

        authorize_url = (
            f"https://{settings.AUTH0_DOMAIN}/authorize?{urlencode(params)}"
        )
        return redirect(authorize_url)


def exchange_auth0_code(code: str) -> dict:
    token_response = requests.post(
        f"https://{settings.AUTH0_DOMAIN}/oauth/token",
        json={
            "grant_type": "authorization_code",
            "client_id": settings.AUTH0_CLIENT_ID,
            "client_secret": settings.AUTH0_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.AUTH0_CALLBACK_URL,
        },
        timeout=10,
    )
    token_response.raise_for_status()
    tokens = token_response.json()

    access_token = tokens.get("access_token")
    if not access_token:
        raise ValueError("Auth0 did not return an access token")

    userinfo_response = requests.get(
        f"https://{settings.AUTH0_DOMAIN}/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
        timeout=10,
    )
    userinfo_response.raise_for_status()
    userinfo = userinfo_response.json()

    email = userinfo.get("email")
    if not email:
        raise ValueError("Auth0 did not return an email")

    return {
        "email": email,
        "provider_id": userinfo.get("sub", ""),
        "display_name": userinfo.get("name", ""),
        "picture": userinfo.get("picture"),
    }