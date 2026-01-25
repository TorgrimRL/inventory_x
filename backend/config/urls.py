"""
URL configuration for backend project.
"""

from django.urls import include, path

urlpatterns = [
    path("api/inventory/", include("api.inventory.urls")),
    path("api/user/", include("api.user.urls")),
]
