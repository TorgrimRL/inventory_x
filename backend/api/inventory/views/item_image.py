from uuid import UUID

from django.core.files.uploadedfile import UploadedFile
from rest_framework import status, views
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from api.inventory.context import get_active_membership_or_raise
from api.inventory.models import InventoryItem
from api.inventory.permissions import IsActiveInventoryOwner

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024


class ItemImageUploadView(views.APIView):
    permission_classes = (IsAuthenticated, IsActiveInventoryOwner)
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request: Request, item_id: UUID) -> Response:
        membership = get_active_membership_or_raise(request)

        try:
            item = InventoryItem.objects.get(
                id=item_id,
                inventory_id=membership.inventory.id,
            )
        except InventoryItem.DoesNotExist:
            return Response(
                {"detail": "Item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        image = request.FILES.get("image")
        if image is None:
            return Response(
                {"detail": "Image file is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(image, UploadedFile):
            return Response(
                {"detail": "Invalid image upload"},
                status=status.HTTP_400_BAD_REQUEST,
            )

            return Response(
                {"detail": "Image file is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image.content_type not in ALLOWED_TYPES:
            return Response(
                {"detail": "File type not supported"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if image.size > MAX_FILE_SIZE:
            return Response(
                {"detail": "File is too large (max 5 MB)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.image.save(image.name, image, save=False)
        item.save(update_fields=["image"])

        return Response(
            {
                "image_url": item.image.url,
                "message": "Image uploaded",
            },
            status=status.HTTP_200_OK,
        )
