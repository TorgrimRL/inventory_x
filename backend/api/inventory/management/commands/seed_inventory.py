import random
import uuid

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.inventory.models import (
    Inventory,
    InventoryItem,
    InventoryMembership,
    ItemCategory,
)


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
                    category = ItemCategory.objects.create(
                        inventory=inv,
                        name=category_name,
                    )
                    categories_for_inv[category_name] = category

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

            items_to_create: list[InventoryItem] = []

            # Ola gets Ola items
            ola_inv = inventories_by_name["Ola AS"]
            for index, (name, price) in enumerate(ola_catalog):
                # Make firsts items UUID static
                item_kwargs = {
                    "inventory": ola_inv,
                    "name": name,
                    "price": price,
                    "stock": random.randint(0, 50),
                }
                if index == 0:
                    item_kwargs["id"] = STATIC_ITEM_UUID

                items_to_create.append(InventoryItem(**item_kwargs))

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

            # Everyone else gets generic items
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

            # --- Category assignment for items ---
            for item in InventoryItem.objects.select_related("inventory").all():
                inv_name = item.inventory.name
                inv_categories = categories_by_inventory.get(str(item.inventory_id), {})

                # Keep some uncategorized to support "No category added" testing
                if item.name in {
                    "Tape (6-pack)",
                    "Label Roll",
                    "Disposable Gloves (100 pcs)",
                }:
                    continue

                if inv_name == "Jessica Cookies AS":
                    lower_name = item.name.lower()
                    if any(keyword in lower_name for keyword in ["milk", "white chocolate"]):
                        category = inv_categories.get("Milk")
                    elif any(keyword in lower_name for keyword in ["bread", "roll"]):
                        category = inv_categories.get("Bread")
                    elif any(keyword in lower_name for keyword in ["frozen", "ice"]):
                        category = inv_categories.get("Frozen")
                    elif any(keyword in lower_name for keyword in ["cookie", "brownie", "blondie", "brookie"]):
                        category = inv_categories.get("Snacks")
                    elif any(keyword in lower_name for keyword in ["vanilla", "dairy", "butter", "yogurt", "cream"]):
                        category = inv_categories.get("Dairy")
                    elif any(keyword in lower_name for keyword in ["drink", "soda", "juice", "coffee", "tea"]):
                        category = inv_categories.get("Drinks")
                    else:
                        category = inv_categories.get("Loaf")
                elif inv_name == "Ola AS":
                    lower_name = item.name.lower()
                    if any(keyword in lower_name for keyword in ["nesbø", "kepler", "engman", "holt"]):
                        category = inv_categories.get("Crime")
                    elif any(keyword in lower_name for keyword in ["quiz", "juleroser", "den fantastiske bussen"]):
                        category = inv_categories.get("Books")
                    else:
                        category = inv_categories.get("Non-fiction")
                else:
                    category = inv_categories.get("Supplies") or inv_categories.get("General")

                if category:
                    item.categories.set([category])

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

        # Count items per inventory from what we created (no DB query needed)
        counts_by_inventory_name = {inv.name: 0 for inv in inventories}
        for it in items_to_create:
            counts_by_inventory_name[it.inventory.name] += 1

        total_items = len(items_to_create)
        total_inventories = len(inventories)

        # Membership counts (we did a mix of bulk_create + create)
        memberships_total = InventoryMembership.objects.count()

        # Useful “persona” checks
        ola_count = counts_by_inventory_name.get("Ola AS", 0)
        jessica_count = counts_by_inventory_name.get("Jessica Cookies AS", 0)

        self.stdout.write(self.style.SUCCESS("✅ Seed completed"))
        self.stdout.write(
            self.style.SUCCESS(
                f"- Inventories: {total_inventories}\n"
                f"- Items: {total_items}\n"
                f"- Memberships: {memberships_total}"
            )
        )

        self.stdout.write(self.style.SUCCESS("\n📦 Items per inventory:"))
        for inv_name in sorted(counts_by_inventory_name.keys()):
            self.stdout.write(
                self.style.SUCCESS(
                    f"- {inv_name}: {counts_by_inventory_name[inv_name]} items"
                )
            )

        self.stdout.write(self.style.SUCCESS("\n👤 Persona sanity checks:"))
        self.stdout.write(
            self.style.SUCCESS(
                f"- Ola AS items: {ola_count} (expected {len(ola_catalog)})"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"- Jessica Cookies AS items: {jessica_count}"
                f" (expected {len(jessica_catalog)})"
            )
        )
