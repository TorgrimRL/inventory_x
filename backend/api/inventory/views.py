from rest_framework.decorators import api_view
from rest_framework.response import Response

from . import services


@api_view(["GET"])
def inventory_list(request):
    data = services.get_all_items()
    return Response({"data": data})
