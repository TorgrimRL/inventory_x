from django.urls import path
from .views import inventory_list, adjust_stock_view

urlpatterns = [
    path("", inventory_list),
    path("<int:item_id>/adjust-stock/", adjust_stock_view),
]
