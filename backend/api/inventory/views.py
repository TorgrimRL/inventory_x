from django.http import JsonResponse
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from api.inventory import services
from api.inventory.contracts import ADJUST_STOCK_RESPONSES
from api.inventory.serializers import AdjustStockSerializer


@api_view(["GET"])
def inventory_list(request):
    data = services.get_all_items()
    return JsonResponse({"data": data})


class AdjustStockView(APIView):
    serializer_class = AdjustStockSerializer

    @extend_schema(
        summary="Adjust item stock",
        responses=ADJUST_STOCK_RESPONSES,
    )
    def post(self, request: Request, item_id: int) -> Response:
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.serializer_class(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"detail": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            item = services.adjust_stock(
                item_id=item_id,
                direction=serializer.validated_data["direction"],
                amount=serializer.validated_data["amount"],
            )
        except LookupError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "item_id": item.id,
                "stock": item.stock,
                "message": "Stock updated",
            },
            status=status.HTTP_200_OK,
        )
