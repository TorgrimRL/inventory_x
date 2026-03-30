import functools

from api.inventory.models import StockLog


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
