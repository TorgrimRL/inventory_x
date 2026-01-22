from django.http import JsonResponse

from . import services


def inventory_list(request):
    data = services.get_all_items()
    return JsonResponse({"data": data})
