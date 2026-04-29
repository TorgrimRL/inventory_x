from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        (
            "inventory",
            "0005_inventoryitem_custom_fields_inventorycustomfield",
        ),
        (
            "inventory",
            "0007_merge_0004_merge_20260409_0705_0006_inventoryitem_low_stock_notification",
        ),
    ]

    operations = []
