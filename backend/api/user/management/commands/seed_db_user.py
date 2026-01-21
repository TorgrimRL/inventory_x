from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Seeds database with mock users using custom UserManager"

    def handle(self, *args, **kwargs):
        # 1. Clean existing users
        User.objects.all().delete()

        # 2. Define mock data
        mock_data = [
            ("admin@example.com", "System Admin", "adminpass123"),
            ("alice@example.com", "Alice Developer", "alicepass456"),
            ("bob@example.com", "Bob Builder", "bobpass789"),
        ]

        # 3. Create users via your Manager
        for email, name, pwd in mock_data:
            # This calls YOUR UserManager.create_user method
            User.objects.create_user(
                email=email,
                password=pwd,
                display_name=name,  # This goes into **extra_fields
            )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully seeded {len(mock_data)} users.")
        )
