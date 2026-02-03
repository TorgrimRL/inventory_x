import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.inventory.models import Inventory, InventoryItem, InventoryMembership


class Command(BaseCommand):
    help = (
        "Seeds database with mock inventory data (items +"
        " inventories + memberships)"
    )

    def handle(self, *args, **kwargs):
        User = get_user_model()

        required_emails = [
            "admin@example.com",
            "alice@example.com",
            "bob@example.com",
        ]
        users = {
            u.email: u for u in User.objects.filter(email__in=required_emails)
        }
        missing = [e for e in required_emails if e not in users]

        if missing:
            raise CommandError(
                f"Missing users {missing}."
                f"   Run `python manage.py seed_users` first."
            )

        with transaction.atomic():
            InventoryMembership.objects.all().delete()
            Inventory.objects.all().delete()
            InventoryItem.objects.all().delete()

            # --- Items  ---
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

            # --- Inventories ---
            inv_specs = [
                ("Ola AS", "123456789"),
                ("Kari AS", "987654321"),
            ]

            inventories: list[Inventory] = []
            for name, org in inv_specs:
                inv = Inventory(name=name, org_number=org)
                inv.full_clean()
                inv.save()
                inventories.append(inv)

            # --- Memberships ---
            admin = users["admin@example.com"]
            alice = users["alice@example.com"]
            bob = users["bob@example.com"]

            InventoryMembership.objects.create(
                inventory=inventories[0],
                user=admin,
                role=InventoryMembership.Role.OWNER,
            )
            InventoryMembership.objects.create(
                inventory=inventories[0],
                user=alice,
                role=InventoryMembership.Role.EMPLOYEE,
            )
            InventoryMembership.objects.create(
                inventory=inventories[1],
                user=bob,
                role=InventoryMembership.Role.OWNER,
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(items)} items."))
        self.stdout.write(
            self.style.SUCCESS("Seeded inventories + memberships.")
        )
