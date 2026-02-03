from django.urls import path

from .views import AdjustStockView, RegisterInventoryView, inventory_list

urlpatterns = [
    path("", inventory_list),
    path(
        "<int:item_id>/adjust-stock/",
        AdjustStockView.as_view(),
        name="adjust-stock",
    ),
    path(
        "register/", RegisterInventoryView.as_view(), name="inventory-register"
    ),
]
