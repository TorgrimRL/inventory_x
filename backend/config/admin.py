from django.apps import apps
from django.contrib import admin

target_apps = ["inventory", "user"]

for app_label in target_apps:
    try:
        app_config = apps.get_app_config(app_label)
        for model in app_config.get_models():
            try:

                class DynamicAdmin(admin.ModelAdmin):
                    list_display = tuple(
                        field.name for field in model._meta.fields
                    )

                admin.site.register(model, DynamicAdmin)
            except admin.sites.AlreadyRegistered:
                pass
    except LookupError:
        pass
