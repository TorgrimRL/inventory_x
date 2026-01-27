from django.urls import path

from .views import adjust_stock_view, inventory_list

urlpatterns = [
    path("", inventory_list),
    path("<int:item_id>/adjust-stock/", adjust_stock_view),
]
