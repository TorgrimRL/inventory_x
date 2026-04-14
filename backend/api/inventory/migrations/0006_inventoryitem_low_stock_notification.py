from typing import ClassVar

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies: ClassVar[list[tuple[str, str]]] = [
        ("inventory", "0003_merge_0002_inventoryitem_image_0002_stocklog"),
    ]

    operations: ClassVar[list[migrations.AddField]] = [
        migrations.AddField(
            model_name="inventoryitem",
            name="low_stock_notification",
            field=models.BooleanField(default=False),
        ),
    ]
