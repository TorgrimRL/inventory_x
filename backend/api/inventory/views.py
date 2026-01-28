import json

from django.http import JsonResponse
from rest_framework.decorators import api_view

from . import services


@api_view(["GET"])
def inventory_list(request):
    data = services.get_all_items()
    return JsonResponse({"data": data})


@api_view(["POST"])
def adjust_stock_view(request, item_id):
    if not request.user.is_authenticated:
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
