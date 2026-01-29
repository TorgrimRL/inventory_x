from django.urls import path

from .views import RegisterInventoryView, inventory_list

urlpatterns = [
    path("", inventory_list),
    path(
        "register/", RegisterInventoryView.as_view(), name="inventory-register"
    ),
]
