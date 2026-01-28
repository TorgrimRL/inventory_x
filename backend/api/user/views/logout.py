from typing import ClassVar

from django.contrib.auth import logout
from django.http import HttpRequest
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.user.serializers import LogoutResSerializer


class LogoutView(views.APIView):
    permission_classes: ClassVar = [IsAuthenticated]

    @extend_schema(
        summary="User Logout",
        responses={
            200: LogoutResSerializer,
            401: OpenApiResponse(
                description="Unauthorized, user not logged inn.",
            ),
        },
    )
    def post(self, request: HttpRequest) -> Response:
        logout(request)

        serializer_data = LogoutResSerializer({"detail": "Session closed"})

        return Response(
            serializer_data.data,
            status=status.HTTP_200_OK,
        )
