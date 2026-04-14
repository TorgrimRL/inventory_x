from django.db import migrations, models

import api.inventory.models


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0004_merge_20260409_0705"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to=api.inventory.models.inventory_item_image_upload_to,
            ),
        ),
    ]
