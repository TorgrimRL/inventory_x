from django.urls import path

from api.inventory.views.active_inventory import ActiveInventoryView
from api.inventory.views.adjust_stock import AdjustStockView
from api.inventory.views.categories import CategoryDetailView, CategoryView
from api.inventory.views.inventory import InventoryView
from api.inventory.views.invite_user import InviteUserView
from api.inventory.views.item_detail import ItemDetailView
from api.inventory.views.list_inventories import ListInventoriesView
from api.inventory.views.list_members import ListMembersView
from api.inventory.views.register_inventory import RegisterInventoryView
from api.inventory.views.remove_member import RemoveMemberView
from api.inventory.views.stock_log import StockLogView

urlpatterns = [
    path("", InventoryView.as_view(), name="inventory"),
    path(
        "<uuid:item_id>/",
        ItemDetailView.as_view(),
        name="item-detail",
    ),
    path(
        "<uuid:item_id>/adjust-stock/",
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
    path(
        "active/<uuid:item_id>/stock-log/",
        StockLogView.as_view(),
        name="stock-log",
    ),
    path(
        "members/",
        ListMembersView.as_view(),
        name="inventory-members",
    ),
    path(
        "members/<uuid:membership_id>/",
        RemoveMemberView.as_view(),
        name="remove-member",
    ),
    path(
        "active/categories/",
        CategoryView.as_view(),
        name="inventory-categories",
    ),
    path(
        "active/categories/<uuid:category_id>/",
        CategoryDetailView.as_view(),
        name="inventory-category-detail",
    ),
]
