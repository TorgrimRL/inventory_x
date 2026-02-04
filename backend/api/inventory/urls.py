from django.urls import path

from .views import AdjustStockView, InventoryView, RegisterInventoryView

urlpatterns = [
    path("", InventoryView.as_view(), name="inventory"),
    path(
        "<int:item_id>/adjust-stock/",
        AdjustStockView.as_view(),
        name="adjust-stock",
    ),
    path(
        "register/", RegisterInventoryView.as_view(), name="inventory-register"
    ),
]
