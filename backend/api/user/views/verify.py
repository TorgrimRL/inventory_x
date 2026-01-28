from django.http import HttpRequest
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status, views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from api.user.serializers import VerifySessionResponseSerializer


class VerifyView(views.APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        summary="Verify User Session",
        description="Checks validity of the token and returns the username.",
        request=None,
        responses={
            200: OpenApiResponse(response=VerifySessionResponseSerializer),
            401: OpenApiResponse(description="Token missing or invalid"),
        },
    )
    def get(self, request: HttpRequest) -> Response:
        # Prepare the raw dictionary
        response_content = {
            "detail": "Session is valid",
            "username": str(request.user),
        }

        # Initialize the serializer with the data
        serializer = VerifySessionResponseSerializer(response_content)

        # Return the validated data
        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
