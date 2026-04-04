import random
import uuid
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from api.inventory.models import (
    (
    Inventory,
   
    InventoryItem,
   
    InventoryMembership,
    StockLog,
),
    ItemCategory,
)


def seeded_stock_and_threshold(index: int) -> tuple[int, int | None]:
    pattern = index % 4

    if pattern == 0:
        return 2, 5  # below threshold
    if pattern == 1:
        return 5, 5  # equal to threshold
    if pattern == 2:
        return 9, 5  # above threshold

    return random.randint(0, 50), None  # no threshold


class Command(BaseCommand):
    help = (
        "Seeds database with mock inventory data (items +"
        " inventories + memberships)"
    )

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Static UUIDs for manual testing
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
                f"Missing users {missing}."
                f"   Run `python manage.py seed_users` first."
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
            # Delete in safe order for FK changes
            InventoryMembership.objects.all().delete()
            InventoryItem.objects.all().delete()
            ItemCategory.objects.all().delete()
            Inventory.objects.all().delete()

            # --- Inventories ---
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
                inv_kwargs = {"name": name, "org_number": org}
                if name == "Ola AS":
                    inv_kwargs["id"] = str(STATIC_INV_UUID)

                inv = Inventory(**inv_kwargs)
                inv.full_clean()
                inv.save()
                inventories.append(inv)
                inventories_by_name[name] = inv

            # --- Memberships ---
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

            # --- Categories (inventory-specific) ---
            categories_by_inventory: dict[str, dict[str, ItemCategory]] = {}

            for inv in inventories:
                if inv.name == "Jessica Cookies AS":
                    category_names = [
                        "Frozen",
                        "Bread",
                        "Loaf",
                        "Milk",
                        "Dairy",
                        "Snacks",
                        "Drinks",
                    ]
                elif inv.name == "Ola AS":
                    category_names = ["Books", "Crime", "Non-fiction"]
                else:
                    category_names = ["General", "Supplies"]

                categories_for_inv: dict[str, ItemCategory] = {}
                for category_name in category_names:
                    created_category = ItemCategory.objects.create(
                        inventory=inv,
                        name=category_name,
                    )
                    categories_for_inv[category_name] = created_category

                categories_by_inventory[str(inv.id)] = categories_for_inv

            # --- Items ---
            # Ola: bookstore / author event (Jo Nesbø)
            ola_catalog = [
                ("Grunnboka — Eyvind Hellstrøm", 449),
                ("Ufred — Åsne Seierstad", 449),
                ("Landet som ble for rikt — Martin Bech Holte", 449),
                ("På min vakt — Jens Stoltenberg / Per Anders Madsen", 499),
                ("Minnesota — Jo Nesbø", 449),
                ("Hushjelpen — Freida McFadden", 249),
                ("Mormor danset i regnet — Trude Teige", 399),
                ("Hele deg — Annette Dragland", 399),
                ("Tørt land — Jørn Lier Horst", 429),
                ("Stargate — Ingvild H. Rishøi", 229),
                ("Den siste saken — Jørn Lier Horst", 429),
                ("Morfar pustet med havet — Trude Teige", 399),
                ("Vagusnerven — Annette Løno / Torkil Færø", 399),
                ("Hushjelpens hemmelighet — Freida McFadden", 249),
                ("Pondus 24/7 — Frode Øverli", 399),
                ("Ildlandet — Pascal Engman", 429),
                ("X — Pascal Engman", 429),
                ("Gater jeg har levd — Nikolai Torgersen", 429),
                ("Søvngjengeren — Lars Kepler", 449),
                ("Sjøfareren — Erika Fatland", 449),
                ("Mormors utrolige venninner — Trude Teige", 399),
                ("Sju kvadratmeter med lås — Jussi Adler-Olsen", 249),
                ("Bestselger — Pascal Engman", 429),
                ("Alternativt statsbudsjett — Martin Bech Holte", 449),
                (
                    "Hvite striper, sorte får — Øistein Monsen "
                    "/ Torgeir Pedersen Krokfjord",
                    399,
                ),
                ("Ikke mennesker jeg kan regne med — Kyrre Andreassen", 399),
                ("Enkene — Pascal Engman", 429),
                ("Kokain — Pascal Engman", 429),
                ("Sorgen i St. Peter Ording — Ingvar Ambjørnsen", 399),
                ("Jævla menn — Andrev Walden", 399),
                ("Rottekongen — Pascal Engman", 429),
                ("Hel ved II — Lars Mytting", 449),
                ("Kvinnen i etasjen over — Freida McFadden", 249),
                ("En lykkelig familie — Stian Hjelvin Andersen", 399),
                ("Å vanne blomster om kvelden — Valérie Perrin", 249),
                ("Den låste døren — Freida McFadden", 249),
                ("Skriket — Jørn Lier Horst / Jan-Erik Fjell", 429),
                ("Juleroser 2025 — Herborg Kråkevik", 499),
                ("Kongeriket — Jo Nesbø", 249),
                ("Skjult skjønnhet — Lucinda Riley / Harry Whittaker", 249),
                ("Min første bakebok — Elin Vatnar Nilsen", 299),
                ("Så gjør vi så — Helga Flatland", 399),
                (
                    "Alt jeg har lært om ledelse — Nicolai Tangen /"
                    " Ellen Emmerentze Jervell",
                    449,
                ),
                ("Doggerland — Agnes Ravatn", 399),
                ("Den fantastiske bussen — Jakob Martin Strid", 349),
                ("Diamanter og rust — Anne Holt", 429),
                ("Mysteriet med hullet i veggen — Camilla Brinck", 299),
                ("Kongen av Os — Jo Nesbø", 449),
                ("Julequiz 2025 — Jarle Enerud", 249),
                ("Let them-teorien — Mel Robbins", 399),
            ]

            # Jessica: cookie shop / production + popup store
            jessica_catalog = [
                # Signatur-cookies (TikTok/viral style)
                ("NY-style Chocolate Chip Cookie (single)", 79),
                ("NY-style Double Chocolate Cookie (single)", 79),
                ("Stuffed Cookie: Nutella (single)", 89),
                ("Stuffed Cookie: Biscoff (single)", 89),
                ("Stuffed Cookie: Salted Caramel (single)", 89),
                ("Brownie Cookie (single)", 79),
                ("Red Velvet Cookie (single)", 79),
                ("White Choc Macadamia Cookie (single)", 79),
                ("Peanut Butter Cookie (single)", 79),
                ("Vegan Chocolate Cookie (single)", 79),
                ("Gluten-free Chocolate Cookie (single)", 89),
                ("Oatmeal Raisin Cookie (single)", 69),
                # Bokser (pop-up salg)
                ("Cookie Box (6 pcs) — assorted", 199),
                ("Cookie Box (12 pcs) — assorted", 349),
                ("Mini Cookies (24 pcs) — assorted", 299),
                ("Cookie Gift Box (premium)", 449),
                ("Pop-up Sampler (mini + dips)", 399),
                # Andre bakevarer
                ("Brownies (box of 6)", 299),
                ("Blondies (box of 6)", 299),
                ("Brookies (box of 6)", 329),
                ("Cinnamon Rolls (box of 4)", 249),
                ("Cupcakes (box of 6)", 329),
                # Dips / toppings (upsell)
                ("Dip: Salted Caramel (200ml)", 79),
                ("Dip: Chocolate Ganache (200ml)", 79),
                ("Dip: Vanilla Cream (200ml)", 79),
                ("Topping: Sprinkles (small jar)", 49),
                ("Topping: Crushed Oreo (small jar)", 49),
                # Råvarer (produksjon)
                ("Flour (5kg)", 149),
                ("Sugar (5kg)", 129),
                ("Brown sugar (2kg)", 109),
                ("Butter (2kg)", 249),
                ("Eggs (30-pack)", 129),
                ("Chocolate chips (1kg)", 159),
                ("Dark chocolate (1kg)", 179),
                ("White chocolate (1kg)", 179),
                ("Cocoa powder (1kg)", 139),
                ("Vanilla extract (250ml)", 119),
                ("Baking powder (500g)", 69),
                ("Sea salt flakes (500g)", 79),
                ("Biscoff spread (1.6kg)", 199),
                ("Hazelnut spread (1kg)", 129),
                ("Macadamia nuts (1kg)", 249),
                ("Peanut butter (1kg)", 119),
                ("Oats (2kg)", 89),
                ("Raisins (1kg)", 79),
                # Emballasje / drift
                ("Cookie Boxes (50 pcs)", 249),
                ("Cupcake Boxes (25 pcs)", 249),
                ("Paper bags (100 pcs)", 199),
                ("Labels / stickers (roll)", 79),
                ("Napkins (500 pcs)", 129),
                ("Gloves (100 pcs)", 99),
                ("Takeaway forks/spoons (100 pcs)", 99),
                ("Shipping boxes (20 pcs)", 199),
                ("Bubble wrap (roll)", 129),
                ("Tape (6-pack)", 129),
            ]

            # Generic set for other inventories (small, neutral)
            generic_catalog = [
                ("Shipping Boxes (20 pcs)", 199),
                ("Label Roll", 79),
                ("Tape (6-pack)", 129),
                ("Disposable Gloves (100 pcs)", 99),
            ]

            def seed_items_with_random_actor(inventory, catalog, is_ola=False):
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
                        item_id=item.id,
                        item_name=item.name,
                        action="create_item",
                        amount=item.stock,
                        current_stock=item.stock,
                        price=item.price,
                        performed_by=actor,
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
                            item_id=item.id,
                            item_name=item.name,
                            action="adjust_stock",
                            amount=adj_amount,
                            direction=direction,
                            current_stock=current_stock,
                            price=item.price,
                            performed_by=adj_actor,
                        )
                        StockLog.objects.filter(pk=adj_log.pk).update(
                            timestamp=ts_adj
                        )

            self.stdout.write(
                "Generating items and historical logs with randomized members."
            )

            # Run Ola's Catalog
            seed_items_with_random_actor(
                inventories_by_name["Ola AS"], ola_catalog, is_ola=True
            )

            # Run Jessica's Catalog
            seed_items_with_random_actor(
                inventories_by_name["Jessica Cookies AS"], jessica_catalog
            )

            # Run Generic Catalog for the rest
            for name, inv in inventories_by_name.items():
                if name not in ["Ola AS", "Jessica Cookies AS"]:
                    seed_items_with_random_actor(inv, generic_catalog)

        # --- Statistics ---
        self.stdout.write(
            self.style.SUCCESS("\n✅ Seed completed successfully")
        )
        self.stdout.write(f"- Inventories: {Inventory.objects.count()}")
        self.stdout.write(f"- Items: {InventoryItem.objects.count()}")
        self.stdout.write(
            f"- Stock Logs: {StockLog.objects.count()} (with history & random"
            "actors)"
        )
        self.stdout.write(
            f"- Memberships: {InventoryMembership.objects.count()}"
        )
