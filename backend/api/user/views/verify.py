from django.http import HttpRequest
from drf_spectacular.utils import extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.user.contracts import VERIFY_RESPONSES
from api.user.serializers import VerifySessionResponseSerializer


class VerifyView(views.APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Verify User Session",
        description="Checks validity of the token and returns the username.",
        request=None,
        responses=VERIFY_RESPONSES,
    )
    def get(self, request: HttpRequest) -> Response:
        response_content = {
            "detail": "Session is valid",
            "username": str(request.user),
        }

        serializer = VerifySessionResponseSerializer(response_content)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
