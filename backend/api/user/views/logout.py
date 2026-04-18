from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import logout
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.user.contracts.logout import LOGOUT_RESPONSES
from api.user.serializers.logout import LogoutResSerializer


def build_auth0_logout_url() -> str:
    params = {
        "client_id": settings.AUTH0_CLIENT_ID,
        "returnTo": settings.AUTH0_LOGOUT_RETURN_TO,
    }
    url = f"https://{settings.AUTH0_DOMAIN}/v2/logout?{urlencode(params)}"

    if settings.AUTH0_FEDERATED_LOGOUT:
        url = f"{url}&federated"

    return url


class LogoutView(views.APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="User Logout",
        description="Close authenticated user",
        request=None,
        responses=LOGOUT_RESPONSES,
    )
    def post(self, request: Request) -> Response:
        is_auth0_login = request.session.get("auth_provider") == "auth0"
        logout_url = build_auth0_logout_url() if is_auth0_login else None

        logout(request._request)

        payload = {
            "detail": "Session closed",
            "logout_url": logout_url,
        }
        serializer = LogoutResSerializer(payload)
        return Response(serializer.data, status=status.HTTP_200_OK)
