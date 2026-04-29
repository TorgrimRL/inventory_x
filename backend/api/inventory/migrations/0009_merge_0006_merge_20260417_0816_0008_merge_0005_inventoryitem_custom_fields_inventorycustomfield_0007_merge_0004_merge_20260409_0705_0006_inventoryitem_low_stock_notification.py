from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0006_merge_20260417_0816"),
        (
            "inventory",
            "0008_merge_0005_inventoryitem_custom_fields_inventorycustomfield_0007_merge_0004_merge_20260409_0705_0006_inventoryitem_low_stock_notification",
        ),
    ]

    operations = []
