import random

from django.core.management.base import BaseCommand

from api.inventory.models import InventoryItem


class Command(BaseCommand):
    help = "Seeds database with mock inventory"

    def handle(self, *args, **kwargs):
        # Clean
        InventoryItem.objects.all().delete()

        # Create
        items = [
            ("Dell XPS 13", 1200),
            ("MacBook Pro", 2500),
            ("Keychron K2", 150),
            ("MX Master 3", 99),
            ("LG Ultrafine", 350),
        ]

        InventoryItem.objects.bulk_create(
            [
                InventoryItem(name=n, price=p, stock=random.randint(0, 50))
                for n, p in items
            ]
        )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(items)} items."))
