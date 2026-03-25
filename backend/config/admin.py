from typing import Any

from django.apps import apps
from django.contrib.admin.decorators import register
from django.contrib.admin.options import ModelAdmin
from django.contrib.admin.sites import AlreadyRegistered, site
from django.forms.models import ModelForm
from django.http import HttpRequest

from api.inventory.models import InventoryItem, ItemCategory

# ==========================================
# CUSTOM ADMIN CONFIGURATIONS
# ==========================================


@register(ItemCategory)
class ItemCategoryAdmin(ModelAdmin):
    list_display = ("name", "inventory", "created_at")
    list_filter = ("inventory",)
    search_fields = ("name", "inventory__name")


@register(InventoryItem)
class InventoryItemAdmin(ModelAdmin):
    list_display = ("name", "inventory", "price", "stock")
    filter_horizontal = ("categories",)

    def get_form(
        self,
        request: HttpRequest,
        obj: Any | None = None,
        change: bool = False,
        **kwargs: Any,
    ) -> type[ModelForm]:
        form = super().get_form(request, obj, **kwargs)

        base_fields: dict[str, Any] = getattr(form, "base_fields", {})

        if "categories" in base_fields:
            if obj is not None:
                # If editing an existing item, only show categories
                # from its inventory
                base_fields[
                    "categories"
                ].queryset = ItemCategory.objects.filter(
                    inventory=obj.inventory
                )
            else:
                # If creating a new item, show no categories until it is
                # saved with an inventory
                base_fields["categories"].queryset = ItemCategory.objects.none()

        return form


# ==========================================
# DYNAMIC REGISTRATION (For everything else)
# ==========================================

target_apps = ["inventory", "user"]

for app_label in target_apps:
    try:
        app_config = apps.get_app_config(app_label)
        for model in app_config.get_models():
            try:

                class DynamicAdmin(ModelAdmin):
                    list_display = tuple(
                        field.name for field in model._meta.fields
                    )

                site.register(model, DynamicAdmin)
            except AlreadyRegistered:
                pass
    except LookupError:
        pass
