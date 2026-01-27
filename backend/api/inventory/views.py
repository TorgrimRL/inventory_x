import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from . import services


def inventory_list(request):
    data = services.get_all_items()
    return JsonResponse({"data": data})


def is_authenticated(request):
    # Minimal "auth": frontend må sende en header
    return request.headers.get("X-Auth") == "1"


@require_POST
def adjust_stock_view(request, item_id):
    if not is_authenticated(request):
        return JsonResponse({"error": "Authentication required"}, status=401)

    try:
        body = json.loads(request.body)
        direction = body.get("direction")
        amount = body.get("amount")

        item = services.adjust_stock(
            item_id=item_id, direction=direction, amount=amount
        )

        return JsonResponse(
            {
                "message": "Stock updated",
                "item_id": item.id,
                "stock": item.stock,
            },
            status=200,
        )

    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=400)

    except LookupError as e:
        return JsonResponse({"error": str(e)}, status=404)

    except Exception:
        return JsonResponse({"error": "Invalid request"}, status=400)
