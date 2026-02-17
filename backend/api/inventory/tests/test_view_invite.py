from django.urls import reverse
from rest_framework import status

from api.inventory.contracts import INVITE_USER_RESPONSES
from api.inventory.models import Inventory, InventoryMembership
from api.tests.base import BaseAPITestCase
from api.user.models import User


class TestInviteUserView(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.owner = User.objects.create(
            email="owner@example.com", password="password"
        )
        self.employee = User.objects.create(
            email="employee@example.com", password="password"
        )
        self.stranger = User.objects.create(
            email="stranger@example.com", password="password"
        )

        self.inventory, _ = Inventory.register_with_owner(
            user=self.owner,
            name="Test Corp",
            org_number="123456789",
        )
        self.url = reverse(
            "inventory-invite", kwargs={"inventory_id": self.inventory.id}
        )

    def test_invite_success(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"email": self.employee.email}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_200_OK
        )

        assert InventoryMembership.objects.filter(
            inventory=self.inventory,
            user=self.employee,
            role=InventoryMembership.Role.EMPLOYEE,
        ).exists()

    def test_invite_permission_denied_for_non_owner(self):
        self.client.force_authenticate(user=self.stranger)
        payload = {"email": self.employee.email}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_403_FORBIDDEN
        )

    def test_invite_invalid_email_format(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"email": "not-an-email"}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_invite_user_not_found(self):
        self.client.force_authenticate(user=self.owner)
        payload = {"email": "ghost@example.com"}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_invite_inventory_not_found(self):
        self.client.force_authenticate(user=self.owner)

        import uuid

        url = reverse("inventory-invite", kwargs={"inventory_id": uuid.uuid4()})
        payload = {"email": self.employee.email}

        response = self.client.post(url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_404_NOT_FOUND
        )
