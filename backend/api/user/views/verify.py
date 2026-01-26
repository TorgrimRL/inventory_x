from typing import ClassVar

from django.http import HttpRequest
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


class VerifyView(views.APIView):
    permission_classes: ClassVar = [IsAuthenticated]

    def get(self, request: HttpRequest) -> Response:
        return Response(
            {
                "detail": "Session is valid",
                "username": str(request.user),
            },
            status=status.HTTP_200_OK,
        )
