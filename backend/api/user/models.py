from __future__ import annotations

import uuid
from typing import Any, ClassVar

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager["User"]):
    """
    User factory for the custom User model.

    Centralizes user creation to ensure:
    - Emails are normalized and validated (via the model's clean method).
    - Passwords are hashed via Django's set_password.

    Note:
        Password strength/complexity validation is not handled here.
    """

    use_in_migrations = True

    def create_user(
        self, email: str, password: str, **extra_fields: Any
    ) -> User:
        """
        Create and persist a user identified by email.

        Args:
            email: The user's email address.
            password: The raw password.
            **extra_fields: Additional fields to be set on the User model.

        Returns:
            User: The created User instance (saved to the database).

        Raises:
            ValueError: If password is not provided.
            ValidationError: If the email is invalid or already exists.
        """
        if not password:
            raise ValueError("Password must be set")

        user = self.model(email=email, **extra_fields)
        user.set_password(password)

        # Ensures validation checks the correct database
        if self._db:
            user._state.db = self._db

        # verify email is correct format and unique in the correct DB
        user.full_clean()

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
    is_active: models.BooleanField[bool, bool] = models.BooleanField(  # type: ignore[reportIncompatibleVariableOverride]
        default=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: ClassVar[list[str]] = []

    objects = UserManager()

    class Meta:
        ordering: ClassVar[list[str]] = ["email"]

    def __str__(self) -> str:
        return self.display_name or self.email

    def clean(self) -> None:
        """
        Normalize email and run standard validation.

        This ensures data consistency even when saving directly with
        non-factory methods.
        """
        super().clean()
        self.email = UserManager.normalize_email(self.email).lower()

    def save(self, *args: Any, **kwargs: Any) -> None:
        """
        Save the user, ensuring full cleanup/normalization runs first.
        """
        self.clean()
        super().save(*args, **kwargs)
