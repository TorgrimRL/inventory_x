from django.urls import path



from .views import AdjustStockView, inventory_list, InventoryView

urlpatterns = [
    path("", inventory_list),
    path(
        "<int:item_id>/adjust-stock/",
        AdjustStockView.as_view(),
        name="adjust-stock",
        
    ),
    path("", InventoryView.as_view()),
]
