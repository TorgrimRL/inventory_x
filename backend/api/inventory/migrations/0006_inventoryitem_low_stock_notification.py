from typing import ClassVar

from django.db import migrations


class Migration(migrations.Migration):
    dependencies: ClassVar[list[tuple[str, str]]] = [
        ("inventory", "0003_merge_0002_inventoryitem_image_0002_stocklog"),
    ]

    operations: ClassVar[list[object]] = []
