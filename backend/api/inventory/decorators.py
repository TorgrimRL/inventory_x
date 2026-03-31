import functools
import logging
from functools import wraps

from django.core.mail import (
    send_mail,  # Assuming you are using Django's built-in mailer
)
from django.template.loader import render_to_string

from api.inventory.models import StockLog

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
        item = func(*args, **kwargs)

        # Check if the item exists and has notifications enabled
        if item and getattr(item, "low_stock_notification", False):
            threshold = getattr(item, "low_stock_threshold", None)

            # Check if it hit or dropped below the threshold.
            if threshold is not None and item.stock <= threshold:
                user = kwargs.get("user")
                recipient_email = (
                    user.email if user and hasattr(user, "email") else None
                )

                display_name = "user"
                if user and hasattr(user, "display_name") and user.display_name:
                    display_name = user.display_name

                if recipient_email and recipient_email != "none":
                    try:
                        context = {
                            "display_name": display_name,
                            "item_name": item.name,
                            "current_stock": item.stock,
                            "threshold": threshold,
                        }

                        # Render the template from your templates folder
                        email_body = render_to_string(
                            "low_stock_notification.txt", context
                        )

                        send_mail(
                            subject=f"⚠️ Low Stock Alert: {item.name}",
                            message=email_body,
                            from_email="noreply@yourdomain.com",
                            recipient_list=[recipient_email],
                            fail_silently=False,
                        )
                    except Exception as e:
                        logger.error(
                            f"Failed to send low stock email for {item.id}: {e}"
                        )

        return item

    return wrapper
