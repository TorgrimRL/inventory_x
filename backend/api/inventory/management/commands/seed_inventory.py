import random
import uuid
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from api.inventory.models import (
    Inventory,
    InventoryItem,
    InventoryMembership,
    StockLog,
)


class Command(BaseCommand):
    help = "Seeds database with mock inventory data and realistic historical StockLog entries with randomized actors."

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Static UUIDs for manual testing consistency
        STATIC_INV_UUID = uuid.UUID("11111111-1111-1111-1111-111111111111")
        STATIC_ITEM_UUID = uuid.UUID("22222222-2222-2222-2222-222222222222")

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
                f"Missing users {missing}. Run `python manage.py seed_users` first."
            )

        admin = users["admin@example.com"]
        alice = users["alice@example.com"]
        bob = users["bob@example.com"]

        # --- Simulated Time Helper ---
        # Starts 30 days ago and moves forward to simulate history
        self.simulated_time = timezone.now() - timedelta(days=30)

        def get_next_timestamp():
            self.simulated_time += timedelta(minutes=random.randint(10, 480))
            return self.simulated_time

        with transaction.atomic():
            self.stdout.write("Wiping old inventory data...")
            InventoryMembership.objects.all().delete()
            StockLog.objects.all().delete()
            InventoryItem.objects.all().delete()
            Inventory.objects.all().delete()

            # --- 1. Inventories ---
            inv_specs = [
                ("Ola AS", "123456789"),
                ("Jessica Cookies AS", "444555666"),
                ("Kari AS", "987654321"),
                ("Nordic Tools AS", "111222333"),
                ("Fjord Supply AS", "222333444"),
                ("Oslo Retail AS", "333444555"),
            ]

            inventories_by_name: dict[str, Inventory] = {}
            for name, org in inv_specs:
                inv = Inventory.objects.create(
                    id=STATIC_INV_UUID if name == "Ola AS" else uuid.uuid4(),
                    name=name,
                    org_number=org,
                )
                inventories_by_name[name] = inv

            # --- 2. Memberships (Must be created before items to pick actors) ---
            # Admin owns everything
            for inv in inventories_by_name.values():
                InventoryMembership.objects.create(
                    inventory=inv,
                    user=admin,
                    role=InventoryMembership.Role.OWNER,
                )

            # Alice works at Ola and Jessica's
            InventoryMembership.objects.create(
                inventory=inventories_by_name["Ola AS"],
                user=alice,
                role=InventoryMembership.Role.EMPLOYEE,
            )
            InventoryMembership.objects.create(
                inventory=inventories_by_name["Jessica Cookies AS"],
                user=alice,
                role=InventoryMembership.Role.EMPLOYEE,
            )

            # Bob owns the last one
            last_inv = list(inventories_by_name.values())[-1]
            InventoryMembership.objects.create(
                inventory=last_inv,
                user=bob,
                role=InventoryMembership.Role.OWNER,
            )

            # --- 3. Catalogs ---
            ola_catalog = [
                ("Grunnboka — Eyvind Hellstrøm", 449),
                ("Ufred — Åsne Seierstad", 449),
                ("Minnesota — Jo Nesbø", 449),
                ("Hushjelpen — Freida McFadden", 249),
                ("Mormor danset i regnet — Trude Teige", 399),
                ("Tørt land — Jørn Lier Horst", 429),
                ("Pondus 24/7 — Frode Øverli", 399),
                ("Søvngjengeren — Lars Kepler", 449),
                ("Sjøfareren — Erika Fatland", 449),
                ("Alt jeg har lært om ledelse — Nicolai Tangen", 449),
            ]

            jessica_catalog = [
                ("NY-style Chocolate Chip Cookie", 79),
                ("NY-style Double Chocolate Cookie", 79),
                ("Stuffed Cookie: Nutella", 89),
                ("Stuffed Cookie: Biscoff", 89),
                ("Cookie Box (6 pcs)", 199),
                ("Cookie Box (12 pcs)", 349),
                ("Flour (5kg)", 149),
                ("Sugar (5kg)", 129),
                ("Butter (2kg)", 249),
                ("Eggs (30-pack)", 129),
            ]

            generic_catalog = [
                ("Shipping Boxes (20 pcs)", 199),
                ("Label Roll", 79),
                ("Tape (6-pack)", 129),
            ]

            # --- 4. Item Creation Logic ---
            def seed_items_with_random_actors(inventory, catalog, is_ola=False):
                # Fetch members specifically for this inventory
                members = [
                    m.user
                    for m in InventoryMembership.objects.filter(
                        inventory=inventory
                    )
                ]

                for index, (name, price) in enumerate(catalog):
                    current_stock = random.randint(5, 40)

                    item = InventoryItem.objects.create(
                        id=STATIC_ITEM_UUID
                        if (is_ola and index == 0)
                        else uuid.uuid4(),
                        inventory=inventory,
                        name=name,
                        price=price,
                        stock=current_stock,
                    )

                    # LOG: Creation (Random member as actor)
                    actor = random.choice(members)
                    ts_creation = get_next_timestamp()

                    log = StockLog.objects.create(
                        inventory=inventory,
                        item_id=item.id,
                        item_name=item.name,
                        action="create_item",
                        amount=item.stock,
                        current_stock=item.stock,
                        price=item.price,
                        performed_by=actor,
                        performed_by_name=actor.display_name or actor.email,
                    )
                    # Force the historical timestamp
                    StockLog.objects.filter(pk=log.pk).update(
                        timestamp=ts_creation
                    )

                    # LOG: 1-3 Random Adjustments later in time
                    for _ in range(random.randint(1, 3)):
                        ts_adj = get_next_timestamp()
                        adj_amount = random.randint(1, 10)
                        direction = random.choice(["increase", "decrease"])

                        # New actor for the adjustment
                        adj_actor = random.choice(members)

                        if (
                            direction == "decrease"
                            and current_stock > adj_amount
                        ):
                            current_stock -= adj_amount
                        else:
                            direction = "increase"
                            current_stock += adj_amount

                        adj_log = StockLog.objects.create(
                            inventory=inventory,
                            item_id=item.id,
                            item_name=item.name,
                            action="adjust_stock",
                            amount=adj_amount,
                            direction=direction,
                            current_stock=current_stock,
                            price=item.price,
                            performed_by=adj_actor,
                            performed_by_name=adj_actor.display_name
                            or adj_actor.email,
                        )
                        StockLog.objects.filter(pk=adj_log.pk).update(
                            timestamp=ts_adj
                        )

            self.stdout.write(
                "Generating items and historical logs with randomized members..."
            )

            # Run Ola's Catalog
            seed_items_with_random_actors(
                inventories_by_name["Ola AS"], ola_catalog, is_ola=True
            )

            # Run Jessica's Catalog
            seed_items_with_random_actors(
                inventories_by_name["Jessica Cookies AS"], jessica_catalog
            )

            # Run Generic Catalog for the rest
            for name, inv in inventories_by_name.items():
                if name not in ["Ola AS", "Jessica Cookies AS"]:
                    seed_items_with_random_actors(inv, generic_catalog)

        # --- Statistics ---
        self.stdout.write(
            self.style.SUCCESS("\n✅ Seed completed successfully")
        )
        self.stdout.write(f"- Inventories: {Inventory.objects.count()}")
        self.stdout.write(f"- Items: {InventoryItem.objects.count()}")
        self.stdout.write(
            f"- Stock Logs: {StockLog.objects.count()} (with history & random actors)"
        )
        self.stdout.write(
            f"- Memberships: {InventoryMembership.objects.count()}"
        )
