import functools
import logging
from functools import wraps

from django.core.mail import (
    send_mail,  # Assuming you are using Django's built-in mailer
)
from django.template.loader import render_to_string

from api.inventory.models import InventoryItem, InventoryMembership, StockLog

logger = logging.getLogger(__name__)


def audit_logger(action_name):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            user = kwargs.get("user")

            if user and not user.is_authenticated:
                user = None

            item_id = kwargs.get("item_id")

            current_stock = None
            item_name = None
            price = None

            if result:
                if isinstance(result, dict):
                    item_id = item_id or result.get("id")
                    item_name = result.get("name")
                    current_stock = result.get("stock")
                    price = result.get("price")
                else:
                    item_id = item_id or getattr(result, "id", None)
                    item_name = getattr(result, "name", None)
                    current_stock = getattr(result, "stock", None)
                    price = getattr(result, "price", None)

            StockLog.objects.create(
                item_id=item_id,
                item_name=item_name,
                action=action_name,
                amount=kwargs.get("amount"),
                direction=kwargs.get("direction"),
                current_stock=current_stock,
                price=price,
                performed_by=user,
            )

            return result

        return wrapper

    return decorator


def notify_low_stock(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        item_id = kwargs.get("item_id")

        # Get the stock info before create or update operations runs.
        prev_stock = None
        if item_id:
            prev_stock = (
                InventoryItem.objects.filter(id=item_id)
                .values_list("stock", flat=True)
                .first()
            )

        item = func(*args, **kwargs)

        # Handle both dict (create_item) and object (adjust_stock/update_item)
        if item:
            is_dict = isinstance(item, dict)
            if is_dict:
                notify_enabled = item.get("low_stock_notification", False)
                threshold = item.get("low_stock_threshold")
                cur_stock = item.get("stock")
                item_name = item.get("name")
                item_id_val = item.get("id")
                inventory_id = item.get("inventory_id")
            else:
                notify_enabled = getattr(item, "low_stock_notification", False)
                threshold = getattr(item, "low_stock_threshold", None)
                cur_stock = getattr(item, "stock", 0)
                item_name = getattr(item, "name", "")
                item_id_val = getattr(item, "id", None)
                inventory_id = getattr(item, "inventory_id", None)

            # LOGIC: Only send if it WAS high and is NOW low.
            if notify_enabled and threshold is not None:
                was_above = prev_stock is None or prev_stock > threshold
                is_now_low = cur_stock <= threshold

                if was_above and is_now_low:
                    # Look up owner's email.
                    membership = (
                        InventoryMembership.objects.select_related("user")
                        .filter(inventory_id=inventory_id, role="owner")
                        .first()
                    )

                    if membership and membership.user:
                        owner = membership.user
                        recipient_email = owner.email
                        display_name = owner.display_name or "Inventory Owner"

                        if recipient_email and recipient_email != "none":
                            try:
                                context = {
                                    "display_name": display_name,
                                    "item_name": item_name,
                                    "current_stock": cur_stock,
                                    "threshold": threshold,
                                }

                                email_body = render_to_string(
                                    "low_stock_notification.txt", context
                                )

                                send_mail(
                                    subject=f"⚠️ Low Stock Alert: {item_name}",
                                    message=email_body,
                                    from_email="noreply@yourdomain.com",
                                    recipient_list=[recipient_email],
                                    fail_silently=False,
                                )
                                logger.info(
                                    "Low stock notification sent for item "
                                    f"{item_id_val}"
                                )
                            except Exception as e:
                                logger.error(
                                    "Failed to send low stock email for "
                                    f"{item_id_val}: {e}"
                                )

        return item

    return wrapper
