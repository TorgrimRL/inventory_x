"""
URL configuration for backend project.
"""

from django.urls import path, include

urlpatterns = [
    path("api/inventory/", include("api.inventory.urls")),
]
