import functools

from api.inventory.models import StockLog


def audit_logger(action_name):
    """
    Decorator to automatically log inventory actions to the StockLog table.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            request = kwargs.get("request")
            user = getattr(request, "user", None)

            if user and not user.is_authenticated:
                user = None

            p_name = user.display_name if user else "System"

            # Extract Item Details
            inv_id = kwargs.get("inventory_id")
            item_id = kwargs.get("item_id")
            item_name = kwargs.get("name")

            current_stock = None
            if result:
                if isinstance(result, dict):
                    current_stock = result.get("stock")
                    item_id = item_id or result.get("id")
                    item_name = item_name or result.get("name")
                else:
                    current_stock = getattr(result, "stock", None)
                    item_id = item_id or getattr(result, "id", None)
                    item_name = item_name or getattr(result, "name", None)

            StockLog.objects.create(
                inventory_id=inv_id,
                item_id=item_id,
                item_name=item_name,
                action=action_name,
                amount=kwargs.get("amount"),
                direction=kwargs.get("direction"),
                current_stock=current_stock,
                performed_by=user,
                performed_by_name=p_name,
            )

            return result

        return wrapper

    return decorator
