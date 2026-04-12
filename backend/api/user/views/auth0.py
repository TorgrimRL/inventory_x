from urllib.parse import urlencode

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
        auth0_user = exchange_auth0_code(serializer.validated_data["code"])

        User = get_user_model()

        user = User.objects.filter(email=auth0_user["email"]).first()

        if user is None:
            user = User(
                email=auth0_user["email"],
                display_name=auth0_user.get("display_name", ""),
            )
            user.set_unusable_password()
            user.save()
        # Create Session
        login(request._request, user)

        return Response(
            {"username": user.email},
            status=status.HTTP_200_OK,
        )


class Auth0StartView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        params = {
            "response_type": "code",
            "client_id": settings.AUTH0_CLIENT_ID,
            "redirect_uri": settings.AUTH0_CALLBACK_URL,
            "scope": "openid profile email",
            "connection": "google-oauth2",
        }

        authorize_url = (
            f"https://{settings.AUTH0_DOMAIN}/authorize?{urlencode(params)}"
        )
        return redirect(authorize_url)


def exchange_auth0_code(code: str) -> dict:
    raise NotImplementedError("Auth0 code exchange not implemented yet")
