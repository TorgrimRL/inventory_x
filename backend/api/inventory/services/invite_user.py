import logging

from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string

from api.inventory.models import Inventory, InventoryMembership
from api.user.models import User
from config import settings

logger = logging.getLogger(__name__)


def invite_user(requestor, inventory_id: str, target_email: str):
    inventory = get_object_or_404(Inventory, id=inventory_id)

    if not inventory.is_owner(requestor):
        raise PermissionError(
            "Only the inventory owner can invite new members."
        )

    try:
        target_user = User.objects.get(email=target_email)
    except User.DoesNotExist:
        raise ValueError(
            f"User with email '{target_email}' does not exist."
        ) from None

    if inventory.is_member(target_user):
        raise ValueError("User is already a member of this inventory.")

    InventoryMembership.objects.create(
        inventory=inventory,
        user=target_user,
        role=InventoryMembership.Role.EMPLOYEE,
    )

    context = {
        "link": settings.HOST_ENDPOINT,
        "user": target_user.display_name or "User",
        "inventory_name": inventory.name,
    }
    mail_body = render_to_string("invite_user_email.txt", context)

    try:
        send_mail(
            subject=f"You've been invited to join '{inventory.name}'",
            message=mail_body,
            from_email="",
            recipient_list=[target_email],
        )
    except Exception as e:
        logger.error(f"Failed to send invitation email to {target_email}: {e}")
