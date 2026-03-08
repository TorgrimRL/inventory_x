from django.urls import path

from api.inventory.views.active_inventory import ActiveInventoryView
from api.inventory.views.adjust_stock import AdjustStockView
from api.inventory.views.inventory import InventoryView
from api.inventory.views.invite_user import InviteUserView
from api.inventory.views.list_inventories import ListInventoriesView
from api.inventory.views.register_inventory import RegisterInventoryView
from api.inventory.views.stock_log import StockLogView
from api.inventory.views.update_item import UpdateItemView

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
    path(
        "inventories/invite/",
        InviteUserView.as_view(),
        name="inventory-invite",
    ),
    path("active/", ActiveInventoryView.as_view(), name="inventory-active"),
    path("<int:item_id>/stock-log", StockLogView.as_view(), name="stock-log"),
]
