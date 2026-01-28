from django.urls import path

from .views import inventory_list, register_inventory_view

urlpatterns = [
    path("", inventory_list),
    path("register/", register_inventory_view, name="inventory-register"),
]
