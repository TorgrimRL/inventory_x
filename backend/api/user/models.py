from __future__ import annotations

import uuid
from typing import Any

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager["User"]):
    """
    User factory for the custom User model.

    Centralizes user creation to ensure:
    - emails are normalized
    - passwords are stored via Django's hashing (set_password)
    - the manager's selected DB alias is respected (self._db)

    Password strength/complexity validation is not handled here
    """

    use_in_migrations = True

    def create_user(
        self, email: str, password: str, **extra_fields: Any
    ) -> User:
        """Create and persist a user identified by email."""
        if not email:
            raise ValueError("Email must be set")
        if not password:
            raise ValueError("Password must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """Custom user: UUID primary key, email-based login."""

    id: models.UUIDField[uuid.UUID, uuid.UUID] = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False
    )
    email: models.EmailField[str, str] = models.EmailField(unique=True)
    display_name: models.CharField[str, str] = models.CharField(
        max_length=80, blank=True
    )

    objects = UserManager()

    def __str__(self):
        return self.display_name or self.email
