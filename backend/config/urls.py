"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.utils import extend_schema, extend_schema_view
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

SchemaView = extend_schema_view(get=extend_schema(exclude=True))(
    SpectacularAPIView
)

urlpatterns = [
    path("api/inventory/", include("api.inventory.urls")),
    path("api/user/", include("api.user.urls")),
    path("api/schema/", SchemaView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("admin/", admin.site.urls),
]
