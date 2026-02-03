from django.urls import path

from .views import AdjustStockView, InventoryView

urlpatterns = [
    path("", InventoryView.as_view(), name="inventory"),
    path(
        "<int:item_id>/adjust-stock/",
        AdjustStockView.as_view(),
        name="adjust-stock",
    ),
]
