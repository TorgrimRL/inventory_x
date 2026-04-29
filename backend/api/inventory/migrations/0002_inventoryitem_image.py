# Generated manually for item image support

from django.db import migrations, models

import api.inventory.models


class Migration(migrations.Migration):
    dependencies = [
        ("inventory", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="inventoryitem",
            name="image",
            field=models.ImageField(
                blank=True,
                null=True,
                upload_to=api.inventory.models.item_image_upload_path,
            ),
        ),
    ]
