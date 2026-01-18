from django.apps import AppConfig
import os


class InventoryConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api.inventory"
    label = "inventory"
