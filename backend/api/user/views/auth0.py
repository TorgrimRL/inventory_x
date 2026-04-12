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
    def post(self, request):
        serializer = Auth0CallbackSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"username": serializer.validated_data["email"]},
            status=status.HTTP_200_OK,
        )


from urllib.parse import urlencode

from django.conf import settings
from django.shortcuts import redirect
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView


class Auth0StartView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        params = {
            "response_type": "code",
            "client_id": settings.AUTH0_CLIENT_ID,
            "redirect_uri": settings.AUTH0_CALLBACK_URL,
            "scope": "openid profile email",
        }

        authorize_url = (
            f"https://{settings.AUTH0_DOMAIN}/authorize?{urlencode(params)}"
        )
        return redirect(authorize_url)
