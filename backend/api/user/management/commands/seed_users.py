import logging
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from api.user.models import User

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Seeds database with mock users. Safe for Development only."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Force execution even if DEBUG is False",
        )

    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG and not options["force"]:
            raise CommandError(
                "DANGER: You are trying to wipe Users in a production "
                "environment (DEBUG=False). Use --force to override."
            )

        mock_data: list[tuple[str, str, str]] = [
            ("admin@example.com", "System Admin", "adminpass123"),
            ("alice@example.com", "", "alicepass456"),
            ("bob@example.com", "Bob Builder", "bobpass789"),
        ]

        try:
            with transaction.atomic():
                self.stdout.write("Wiping existing users...")
                User.objects.all().delete()

                self.stdout.write("Creating new users...")
                for email, name, pwd in mock_data:
                    User.objects.create_user(
                        email=email,
                        password=pwd,
                        display_name=name,
                    )

        except Exception as e:
            raise CommandError(f"Seeding Failed: {e}") from e

        self.stdout.write(
            self.style.SUCCESS(f"Successfully seeded {len(mock_data)} users.")
        )
