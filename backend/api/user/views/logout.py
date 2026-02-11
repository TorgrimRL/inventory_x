from django.contrib.auth import logout
from django.http import HttpRequest
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.user.contracts.logout import LOGOUT_RESPONSES
from api.user.serializers.logout import LogoutResSerializer


class LogoutView(views.APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="User Logout",
        description="Close authenticated user",
        request=None,
        responses=LOGOUT_RESPONSES,
    )
    def post(self, request: HttpRequest) -> Response:
        logout(request)

        serializer_data = LogoutResSerializer({"detail": "Session closed"})
        return Response(
            serializer_data.data,
            status=status.HTTP_200_OK,
        )
