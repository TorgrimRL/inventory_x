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
            # Delete in safe order for FK changes
            InventoryMembership.objects.all().delete()
            InventoryItem.objects.all().delete()
            Inventory.objects.all().delete()

            # --- Inventories ---
            # Keep Ola AS + others, but add Jessica explicitly
            inv_specs = [
                ("Ola AS", "123456789"),  # Ola's bookstore
                ("Jessica Cookies AS", "444555666"),  # Jessica's cookie shop
                ("Kari AS", "987654321"),
                ("Nordic Tools AS", "111222333"),
                ("Fjord Supply AS", "222333444"),
                ("Oslo Retail AS", "333444555"),
            ]

            inventories: list[Inventory] = []
            inventories_by_name: dict[str, Inventory] = {}

            for name, org in inv_specs:
                inv = Inventory(name=name, org_number=org)
                inv.full_clean()
                inv.save()
                inventories.append(inv)
                inventories_by_name[name] = inv

            # --- Items ---
            # Ola: bookstore / author event (Jo Nesbø)
            ola_catalog = [
                ("Jo Nesbø — Latest Release (Hardcover)", 399),
                ("Jo Nesbø — Latest Release (Paperback)", 249),
                ("Book: Crime Novel Bestseller", 299),
                ("Book: Children’s Picture Book", 199),
                ("Notebook (A5)", 69),
                ("Bookmark Pack", 39),
            ]

            # Jessica: cookie shop / production + popup store
            jessica_catalog = [
                ("Chocolate Chip Cookies (box of 12)", 129),
                ("Double Chocolate Cookies (box of 12)", 139),
                ("Oatmeal Raisin Cookies (box of 12)", 119),
                ("Cookie Dough (2kg bucket)", 299),
                ("Chocolate Chips (1kg)", 159),
                ("Packaging: Cookie Boxes (50 pcs)", 249),
            ]

            # Generic set for other inventories (small, neutral)
            generic_catalog = [
                ("Shipping Boxes (20 pcs)", 199),
                ("Label Roll", 79),
                ("Tape (6-pack)", 129),
                ("Disposable Gloves (100 pcs)", 99),
            ]

            items_to_create: list[InventoryItem] = []

            # Ola gets Ola items
            ola_inv = inventories_by_name["Ola AS"]
            for name, price in ola_catalog:
                items_to_create.append(
                    InventoryItem(
                        inventory=ola_inv,
                        name=name,
                        price=price,
                        stock=random.randint(0, 50),
                    )
                )

            # Jessica gets Jessica items
            jessica_inv = inventories_by_name["Jessica Cookies AS"]
            for name, price in jessica_catalog:
                items_to_create.append(
                    InventoryItem(
                        inventory=jessica_inv,
                        name=name,
                        price=price,
                        stock=random.randint(0, 50),
                    )
                )

            # Everyone else gets generic items (so they aren’t empty)
            for inv in inventories:
                if inv.id in (ola_inv.id, jessica_inv.id):
                    continue

                for name, price in generic_catalog:
                    items_to_create.append(
                        InventoryItem(
                            inventory=inv,
                            name=name,
                            price=price,
                            stock=random.randint(0, 50),
                        )
                    )

            InventoryItem.objects.bulk_create(items_to_create)

            # --- Memberships ---
            admin = users["admin@example.com"]
            alice = users["alice@example.com"]
            bob = users["bob@example.com"]

            # Admin is owner of all
            InventoryMembership.objects.bulk_create(
                [
                    InventoryMembership(
                        inventory=inv,
                        user=admin,
                        role=InventoryMembership.Role.OWNER,
                    )
                    for inv in inventories
                ]
            )

            # Alice is an employee in two (keep same structure)
            # Give her Ola + Jessica to match the personas nicely
            InventoryMembership.objects.bulk_create(
                [
                    InventoryMembership(
                        inventory=ola_inv,
                        user=alice,
                        role=InventoryMembership.Role.EMPLOYEE,
                    ),
                    InventoryMembership(
                        inventory=jessica_inv,
                        user=alice,
                        role=InventoryMembership.Role.EMPLOYEE,
                    ),
                ]
            )

            # Bob is owner in one (keep: last inventory)
            InventoryMembership.objects.create(
                inventory=inventories[-1],
                user=bob,
                role=InventoryMembership.Role.OWNER,
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(items_to_create)} items across {len(inventories)} inventories."
            )
        )
        self.stdout.write(self.style.SUCCESS("Seeded inventories + memberships."))
