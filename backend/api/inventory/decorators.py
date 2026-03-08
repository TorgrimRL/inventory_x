import functools

from api.inventory.models import StockLog


def audit_logger(action_name):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Execute the actual function
            result = func(*args, **kwargs)

            inv_id = kwargs.get("inventory_id")
            # Create the log entry
            StockLog.objects.create(
                inventory_id=inv_id,
                action=action_name,
                changes={
                    "details": str(kwargs),
                },
            )
            return result

        return wrapper

    return decorator
