import io
import uuid

from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image
from rest_framework import status

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
from api.inventory.models import Inventory, InventoryItem, InventoryMembership
from api.tests.base import BaseAPITestCase


def create_test_image(name: str = "milk.png", size=(50, 50)):
    buffer = io.BytesIO()
    image = Image.new("RGB", size=size, color="blue")
    image.save(buffer, format="PNG")
    buffer.seek(0)
    return SimpleUploadedFile(name, buffer.read(), content_type="image/png")


class ItemImageUploadTests(BaseAPITestCase):
    def setUp(self):
        self.user = self.create_user(
            email="owner@test.com",
            password="password123",
        )
        self.client.force_authenticate(self.user)

        self.inventory = Inventory.objects.create(
            name="Jessica Cookies AS",
            org_number="123456789",
        )
        InventoryMembership.objects.create(
            user=self.user,
            inventory=self.inventory,
            role=InventoryMembership.Role.OWNER,
        )

        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        self.item = InventoryItem.objects.create(
            inventory=self.inventory,
            name="Milk",
            price=30,
            stock=5,
        )

    def test_upload_image_successfully(self):
        url = reverse("item-image-upload", args=[self.item.id])
        image = create_test_image()

        response = self.client.post(url, {"image": image}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertTrue(bool(self.item.image))
        self.assertEqual(response.json()["message"], "Image uploaded")

    def test_upload_fails_for_invalid_file_type(self):
        url = reverse("item-image-upload", args=[self.item.id])
        invalid = SimpleUploadedFile(
            "milk.gif",
            b"gifdata",
            content_type="image/gif",
        )

        response = self.client.post(url, {"image": invalid}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json()["detail"], "File type not supported")

    def test_upload_fails_for_file_too_large(self):
        url = reverse("item-image-upload", args=[self.item.id])
        image = SimpleUploadedFile(
            "large.png",
            b"x" * (5 * 1024 * 1024 + 1),
            content_type="image/png",
        )

        response = self.client.post(url, {"image": image}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["detail"],
            "File is too large (max 5 MB)",
        )

    def test_upload_fails_if_item_does_not_exist(self):
        url = reverse("item-image-upload", args=[uuid.uuid4()])
        image = create_test_image()

        response = self.client.post(url, {"image": image}, format="multipart")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json()["detail"], "Item not found")
