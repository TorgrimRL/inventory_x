from django.urls import path

from .views import (
    AdjustStockView,
    InventoryView,
    ListInventoriesView,
    RegisterInventoryView,
    UpdateItemView,
)

urlpatterns = [
    path("", InventoryView.as_view(), name="inventory"),
    path(
        "<int:item_id>/",
        UpdateItemView.as_view(),
        name="update-item",
    ),
    path(
        "<int:item_id>/adjust-stock/",
        AdjustStockView.as_view(),
        name="adjust-stock",
    ),
    path(
        "register/", RegisterInventoryView.as_view(), name="inventory-register"
    ),
    path(
        "inventories/", ListInventoriesView.as_view(), name="inventories-list"
    ),
]
