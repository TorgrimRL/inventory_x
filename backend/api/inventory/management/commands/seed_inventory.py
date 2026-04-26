import random
import shutil
import uuid
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from api.inventory.models import (
    Inventory,
    InventoryCustomField,
    InventoryItem,
    InventoryMembership,
    ItemCategory,
    StockLog,
)


SEED_DEMO_IMAGE_MAP = {
    "milk": "milk.svg",
    "bread": "bread.svg",
    "loaf": "bread.svg",
    "eggs": "eggs.svg",
    "butter": "butter.svg",
    "cheese": "cheese.svg",
    "apples": "apples.svg",
    "bananas": "bananas.svg",
    "coffee": "coffee.svg",
    "rice": "rice.svg",
    "tomatoes": "tomatoes.svg",
}


def seeded_stock_and_threshold(index: int) -> tuple[int, int | None]:
    pattern = index % 4

    if pattern == 0:
        return 2, 5  # below threshold
    if pattern == 1:
        return 5, 5  # equal to threshold
    if pattern == 2:
        return 9, 5  # above threshold

    return random.randint(6, 18), None  # no threshold


def pick_seed_demo_image_filename(item_name: str) -> str | None:
    normalized_name = item_name.lower()
    for key, filename in SEED_DEMO_IMAGE_MAP.items():
        if key in normalized_name:
            return filename
    return None


def attach_seed_demo_image(item: InventoryItem, filename: str) -> bool:
    workspace_root = settings.BASE_DIR.parent
    source = (
        workspace_root
        / "frontend"
        / "public"
        / "demo-seed-images"
        / filename
    )
    if not source.exists():
        return False

    destination_relative = (
        f"item-images/{item.inventory_id}/{item.id}{Path(filename).suffix}"
    )
    destination = Path(settings.MEDIA_ROOT) / destination_relative
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, destination)

    item.image.name = destination_relative
    item.save(update_fields=["image"])
    return True


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
        STOCK_LOG_CUTOFF = timezone.make_aware(
            timezone.datetime(2026, 6, 15, 23, 59, 59)
        )

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
        # Starts in early 2024 and moves forward to simulate longer history.
        # Keep all seeded stock logs at or before mid-June 2026.
        self.simulated_time = timezone.make_aware(
            timezone.datetime(2024, 1, 5, 9, 0, 0)
        )

        def get_next_timestamp():
            if self.simulated_time.year <= 2024:
                self.simulated_time += timedelta(days=random.randint(10, 24))
            else:
                self.simulated_time += timedelta(days=random.randint(18, 35))
            return min(self.simulated_time, STOCK_LOG_CUTOFF)

        seeded_images_attached = 0

        with transaction.atomic():
            # Delete in safe order for FK changes
            InventoryMembership.objects.all().delete()
            InventoryItem.objects.all().delete()
            ItemCategory.objects.all().delete()
            InventoryCustomField.objects.all().delete()
            Inventory.objects.all().delete()

            # --- Inventories ---
            inv_specs = [
                ("Ola AS", "123456789"),  # Ola's bookstore
                ("Jessica Cookies AS", "444555666"),  # Jessica's cookie shop
                ("Kari AS", "987654321"),
                ("Survival Camp Gear AS", "111222333"),
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
                elif inv.name == "Survival Camp Gear AS":
                    category_names = ["Survival", "Weapons", "Wacky"]
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

            # --- Custom Fields ---
            custom_fields_by_inventory: dict[
                str, dict[str, InventoryCustomField]
            ] = {}

            for inv in inventories:
                if inv.name == "Jessica Cookies AS":
                    cf_data = [("Allergens", "text"), ("Batch Number", "text")]
                elif inv.name == "Ola AS":
                    cf_data = [
                        ("Location", "text"),
                        ("Condition", "text"),
                        ("Pages", "number"),
                    ]
                else:
                    cf_data = [
                        ("Location", "text"),
                        ("Warranty Months", "number"),
                    ]

                cfs_for_inv = {}
                for cf_name, cf_type in cf_data:
                    cf = InventoryCustomField.objects.create(
                        inventory=inv, name=cf_name, data_type=cf_type
                    )
                    cfs_for_inv[cf_name] = cf
                custom_fields_by_inventory[str(inv.id)] = cfs_for_inv

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
                # Demo-friendly grocery items so image support is visible after seeding
                ("Milk (1L)", 32),
                ("Bread Loaf", 45),
                ("Apples (1kg)", 49),
                ("Bananas (1kg)", 39),
                ("Tomatoes (500g)", 35),
                ("Coffee Beans (1kg)", 189),
                ("Rice (2kg)", 59),
                ("Cheese (1kg)", 129),
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

            camping_catalog = [
                ("A-Matchsticks", 10),
                ("Bear spray original", 399),
                ("Bear spray (highly flammable version)", 499),
                ("Bow and arrow", 1299),
                ("Tent", 2499),
                ("Hannah Montana bear spray", 599),
                ("Hannah Montana bear spray flammable", 699),
                ("Solar panel", 3499),
            ]

            def pick_categories_for_item(inventory, item_name: str):
                category_map = categories_by_inventory.get(
                    str(inventory.id), {}
                )

                if inventory.name == "Jessica Cookies AS":
                    lowered = item_name.lower()
                    picked: list[str] = []

                    if any(
                        word in lowered
                        for word in [
                            "cookie",
                            "brownie",
                            "blondie",
                            "brookie",
                            "cupcake",
                        ]
                    ):
                        picked.append("Snacks")
                    if any(
                        word in lowered for word in ["dip", "vanilla cream"]
                    ):
                        picked.append("Drinks")
                    if any(
                        word in lowered
                        for word in [
                            "flour",
                            "sugar",
                            "butter",
                            "eggs",
                            "chocolate",
                            "cocoa",
                            "vanilla",
                            "baking powder",
                            "salt",
                            "biscoff",
                            "hazelnut",
                            "macadamia",
                            "peanut butter",
                            "oats",
                            "raisins",
                        ]
                    ):
                        picked.append(
                            "Dairy"
                            if "butter" in lowered or "eggs" in lowered
                            else "Milk"
                        )
                    if any(
                        word in lowered
                        for word in [
                            "boxes",
                            "paper bags",
                            "labels",
                            "napkins",
                            "gloves",
                            "takeaway",
                            "shipping",
                            "bubble wrap",
                            "tape",
                        ]
                    ):
                        picked.append("Bread")

                    return [
                        category_map[name]
                        for name in picked
                        if name in category_map
                    ]

                if inventory.name == "Survival Camp Gear AS":
                    lowered = item_name.lower()
                    picked = []
                    if "bear spray" in lowered or "bow" in lowered:
                        picked.append("Weapons")
                    if "hannah montana" in lowered or "flammable" in lowered:
                        picked.append("Wacky")
                    if not picked:
                        picked.append("Survival")

                    return [
                        category_map[name]
                        for name in picked
                        if name in category_map
                    ]

                default_category = category_map.get("General") or next(
                    iter(category_map.values()), None
                )
                return [default_category] if default_category else []

            def build_item_description(inventory, item_name: str) -> str:
                custom_descriptions = {
                    "Ola AS": {
                        "Minnesota — Jo Nesbø": (
                            "A crime novel by Jo Nesbø, part of the store's "
                            "popular Nordic noir selection. "
                            "Frequently featured in promotions and bestseller "
                            "displays."
                        ),
                        "Kongeriket — Jo Nesbø": (
                            "A bestselling novel by Jo Nesbø, stocked in the "
                            "Norwegian fiction section. "
                            "Tracked for high demand and seasonal sales."
                        ),
                        "Ufred — Åsne Seierstad": (
                            "A non-fiction title by Åsne Seierstad, covering "
                            "current global issues. "
                            "Part of the store's curated journalism and "
                            "documentary section."
                        ),
                        "Min første bakebok — Elin Vatnar Nilsen": (
                            "A beginner-friendly cookbook designed for "
                            "children and families. "
                            "Often displayed in the gift and hobby section."
                        ),
                    },
                    "Jessica Cookies AS": {
                        "NY-style Chocolate Chip Cookie (single)": (
                            "A large, soft cookie inspired by classic "
                            "New York-style baking, "
                            "with a crisp outer layer and melted "
                            "chocolate chunks inside."
                        ),
                        "Stuffed Cookie: Nutella (single)": (
                            "A premium cookie filled with a soft Nutella "
                            "center. "
                            "One of the shop's best-selling and most "
                            "popular items."
                        ),
                        "Cookie Box (6 pcs) — assorted": (
                            "A box containing six assorted cookies. "
                            "Commonly used for takeaway orders, gifts, "
                            "and pre-orders."
                        ),
                        "Brownies (box of 6)": (
                            "A box of freshly baked brownies, prepared "
                            "for retail sale "
                            "and customer orders."
                        ),
                        "Dip: Salted Caramel (200ml)": (
                            "A rich salted caramel dip used as an add-on "
                            "for cookies "
                            "and dessert boxes."
                        ),
                        "Flour (5kg)": (
                            "Bulk flour used in daily cookie production. "
                            "Tracked as a core ingredient in the bakery "
                            "workflow."
                        ),
                        "Butter (2kg)": (
                            "Butter used in baking dough and fillings. "
                            "A key ingredient for maintaining product "
                            "quality."
                        ),
                    },
                    "Survival Camp Gear AS": {
                        "Tent": (
                            "A durable camping tent designed for outdoor "
                            "trips and extended use. "
                            "Tracked as essential gear in the survival "
                            "inventory."
                        ),
                        "Solar panel": (
                            "A portable solar panel used for charging "
                            "devices in remote areas. "
                            "Part of the store's energy and survival "
                            "equipment range."
                        ),
                        "Bow and arrow": (
                            "Outdoor equipment used for survival training "
                            "and recreational activities. "
                            "Handled as specialized gear in inventory "
                            "tracking."
                        ),
                        "Bear spray original": (
                            "Safety equipment designed for protection "
                            "in wildlife areas. "
                            "Stored and tracked as a regulated "
                            "item."
                        ),
                    },
                }

                inventory_descriptions = custom_descriptions.get(
                    inventory.name, {}
                )

                return inventory_descriptions.get(item_name, "")

            def seed_items_with_random_actor(inventory, catalog, is_ola=False):
                members = [
                    m.user
                    for m in InventoryMembership.objects.filter(
                        inventory=inventory
                    )
                ]

                for index, (name, base_price) in enumerate(catalog):
                    final_stock, low_stock_threshold = (
                        seeded_stock_and_threshold(index)
                    )
                    final_target_date = timezone.make_aware(
                        timezone.datetime(
                            2026,
                            6,
                            min(10 + (index % 6), 15),
                            9,
                            0,
                            0,
                        )
                    )

                    initial_stock = final_stock + random.randint(20, 80)
                    current_stock = initial_stock
                    current_price = base_price

                    mock_cf_data = {}
                    inv_cfs = custom_fields_by_inventory.get(
                        str(inventory.id), {}
                    )

                    if inventory.name == "Jessica Cookies AS":
                        if "Allergens" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Allergens"].id)] = (
                                random.choice(
                                    ["None", "Nuts", "Gluten", "Dairy", "Soy"]
                                )
                            )
                        if "Batch Number" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Batch Number"].id)] = (
                                f"BTH-{random.randint(1000, 9999)}"
                            )
                    elif inventory.name == "Ola AS":
                        if "Location" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Location"].id)] = (
                                random.choice(
                                    ["Aisle 1", "Aisle 2", "Front", "Storage"]
                                )
                            )
                        if "Condition" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Condition"].id)] = (
                                random.choice(
                                    ["New", "Used - Good", "Used - Fair"]
                                )
                            )
                        if "Pages" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Pages"].id)] = str(
                                random.randint(100, 1000)
                            )
                    else:
                        if "Location" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Location"].id)] = (
                                random.choice(["Warehouse A", "Warehouse B"])
                            )
                        if "Warranty Months" in inv_cfs:
                            mock_cf_data[str(inv_cfs["Warranty Months"].id)] = (
                                str(random.choice([0, 6, 12, 24]))
                            )

                    item = InventoryItem.objects.create(
                        id=STATIC_ITEM_UUID
                        if (is_ola and index == 0)
                        else uuid.uuid4(),
                        inventory=inventory,
                        name=name,
                        price=base_price,
                        stock=final_stock,
                        low_stock_threshold=low_stock_threshold,
                        description=build_item_description(inventory, name),
                        custom_fields=mock_cf_data,
                    )

                    seed_demo_image_filename = pick_seed_demo_image_filename(
                        name
                    )
                    if seed_demo_image_filename and attach_seed_demo_image(
                        item, seed_demo_image_filename
                    ):
                        seeded_images_attached += 1

                    selected_categories = pick_categories_for_item(
                        inventory, name
                    )
                    if selected_categories:
                        item.categories.set(selected_categories)

                    actor = random.choice(members)
                    ts_creation = min(
                        timezone.make_aware(
                            timezone.datetime(
                                2024,
                                1 + (index % 6),
                                min(5 + (index % 20), 28),
                                10,
                                0,
                                0,
                            )
                        ),
                        STOCK_LOG_CUTOFF,
                    )

                    log = StockLog.objects.create(
                        item_id=item.id,
                        item_name=item.name,
                        action="create_item",
                        amount=initial_stock,
                        current_stock=initial_stock,
                        price=current_price,
                        performed_by=actor,
                    )
                    StockLog.objects.filter(pk=log.pk).update(
                        timestamp=ts_creation
                    )

                    current_ts = ts_creation
                    timeline_points = [
                        (2024, 3),
                        (2024, 6),
                        (2024, 9),
                        (2024, 12),
                        (2025, 2),
                        (2025, 4),
                        (2025, 6),
                        (2025, 8),
                        (2025, 10),
                        (2025, 12),
                        (2026, 1),
                        (2026, 2),
                        (2026, 3),
                        (2026, 4),
                        (2026, 5),
                        (2026, 6),
                    ]

                    for year, month in timeline_points:
                        ts_adj = timezone.make_aware(
                            timezone.datetime(
                                year,
                                month,
                                min(5 + (index % 20), 28),
                                11,
                                0,
                                0,
                            )
                        )

                        if ts_adj <= current_ts:
                            ts_adj = current_ts + timedelta(hours=1)

                        ts_adj = min(ts_adj, STOCK_LOG_CUTOFF)
                        adj_actor = random.choice(members)

                        if month in {3, 6, 9, 12}:
                            restock_amount = random.randint(12, 40)
                            current_stock += restock_amount
                            direction = "increase"
                            amount = restock_amount
                        else:
                            seasonal_multiplier = 1.0
                            if inventory.name == "Jessica Cookies AS" and (
                                year,
                                month,
                            ) in {
                                (2024, 12),
                                (2025, 12),
                                (2026, 4),
                                (2026, 5),
                                (2026, 6),
                            }:
                                seasonal_multiplier = 2.2
                            elif inventory.name == "Ola AS" and (
                                year,
                                month,
                            ) in {
                                (2024, 6),
                                (2024, 12),
                                (2025, 6),
                                (2025, 12),
                                (2026, 6),
                            }:
                                seasonal_multiplier = 1.7

                            max_decrease = max(
                                4,
                                int(
                                    (initial_stock * 0.16) * seasonal_multiplier
                                ),
                            )
                            amount = min(
                                current_stock,
                                random.randint(4, max_decrease),
                            )
                            if amount <= 0:
                                amount = 1
                            current_stock = max(0, current_stock - amount)
                            direction = "decrease"

                        if (year, month) in {
                            (2024, 6),
                            (2024, 12),
                            (2025, 5),
                            (2025, 11),
                            (2026, 3),
                            (2026, 6),
                        } or random.random() < 0.08:
                            price_shift = random.choice(
                                [-0.10, -0.05, 0.06, 0.12]
                            )
                            current_price = max(
                                10,
                                round(current_price * (1 + price_shift)),
                            )

                        adj_log = StockLog.objects.create(
                            item_id=item.id,
                            item_name=item.name,
                            action="adjust_stock",
                            amount=amount,
                            direction=direction,
                            current_stock=current_stock,
                            price=current_price,
                            performed_by=adj_actor,
                        )
                        StockLog.objects.filter(pk=adj_log.pk).update(
                            timestamp=ts_adj
                        )
                        current_ts = ts_adj

                    item.stock = final_stock
                    item.price = current_price
                    item.save(update_fields=["stock", "price"])

                    final_log = StockLog.objects.create(
                        item_id=item.id,
                        item_name=item.name,
                        action="adjust_stock",
                        amount=abs(current_stock - final_stock),
                        direction=(
                            "increase"
                            if final_stock > current_stock
                            else "decrease"
                        ),
                        current_stock=final_stock,
                        price=current_price,
                        performed_by=random.choice(members),
                    )
                    StockLog.objects.filter(pk=final_log.pk).update(
                        timestamp=min(final_target_date, STOCK_LOG_CUTOFF)
                    )

            self.stdout.write(
                "Generating items and historical logs with randomized members.."
            )

            seed_items_with_random_actor(
                inventories_by_name["Ola AS"], ola_catalog, is_ola=True
            )
            seed_items_with_random_actor(
                inventories_by_name["Jessica Cookies AS"], jessica_catalog
            )
            seed_items_with_random_actor(
                inventories_by_name["Survival Camp Gear AS"], camping_catalog
            )
            for name, inv in inventories_by_name.items():
                if name not in [
                    "Ola AS",
                    "Jessica Cookies AS",
                    "Survival Camp Gear AS",
                ]:
                    seed_items_with_random_actor(inv, generic_catalog)

            counts_by_inventory_name = {
                inv.name: InventoryItem.objects.filter(inventory=inv).count()
                for inv in inventories
            }

            self.stdout.write(
                self.style.SUCCESS("\n✅ Seed completed successfully")
            )
            self.stdout.write(f"- Inventories: {Inventory.objects.count()}")
            self.stdout.write(
                f"- Custom Fields: {InventoryCustomField.objects.count()}"
            )
            self.stdout.write(f"- Items: {InventoryItem.objects.count()}")

            descriptions_added_count = InventoryItem.objects.exclude(
                description=""
            ).count()

            self.stdout.write(
                f"- Descriptions added: {descriptions_added_count}"
            )
            self.stdout.write(
                f"- Seed demo images attached: {seeded_images_attached}"
            )

            self.stdout.write(
                f"- Stock Logs: {StockLog.objects.count()} "
                "(with history & random actors)"
            )
            self.stdout.write(
                f"- Memberships: {InventoryMembership.objects.count()}"
            )

            self.stdout.write(self.style.SUCCESS("\n📦 Items per inventory:"))
            for inv_name in sorted(counts_by_inventory_name.keys()):
                self.stdout.write(
                    f"  - {inv_name}: {counts_by_inventory_name[inv_name]}"
                )
