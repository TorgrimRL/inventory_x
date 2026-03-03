from django.urls import reverse
from rest_framework import status

from api.inventory.context import SESSION_ACTIVE_INVENTORY_KEY
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
        self.url = reverse("inventory-invite")

        self.client.force_authenticate(user=self.owner)

        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

    def test_invite_success(self):
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
        InventoryMembership.objects.create(
            inventory=self.inventory,
            user=self.employee,
            role=InventoryMembership.Role.EMPLOYEE,
        )

        self.client.logout()
        self.client.force_authenticate(user=self.employee)

        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = str(self.inventory.id)
        session.save()

        payload = {"email": self.stranger.email}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_403_FORBIDDEN
        )

    def test_invite_invalid_email_format(self):
        payload = {"email": "not-an-email"}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_invite_user_not_found(self):
        payload = {"email": "ghost@example.com"}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_400_BAD_REQUEST
        )

    def test_invite_inventory_not_found(self):
        import uuid

        random_id = str(uuid.uuid4())

        session = self.client.session
        session[SESSION_ACTIVE_INVENTORY_KEY] = random_id
        session.save()

        payload = {"email": self.employee.email}

        response = self.client.post(self.url, payload)

        self.assert_contract(
            response, INVITE_USER_RESPONSES, status.HTTP_409_CONFLICT
        )

        updated_session = self.client.session
        self.assertNotIn(SESSION_ACTIVE_INVENTORY_KEY, updated_session)
