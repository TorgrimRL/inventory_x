from typing import ClassVar

from django.contrib.auth import logout
from django.http import HttpRequest
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class LogoutView(views.APIView):
    permission_classes: ClassVar = [IsAuthenticated]

    def post(self, request: HttpRequest) -> Response:
        logout(request)
        return Response(
            {
                "detail": "Sesion closed",
            },
            status=status.HTTP_200_OK,
        )
