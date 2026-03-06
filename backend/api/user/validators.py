from django.contrib.auth.password_validation import (
    CommonPasswordValidator,
    NumericPasswordValidator,
)
from django.core.exceptions import ValidationError


class CustomMinimumLengthValidator:
    def __init__(self, min_length):
        self.min_length = min_length

    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                f"Password must be at least {self.min_length} long.",
                code="password_too_short",
            )


class CustomCommonPasswordValidator(CommonPasswordValidator):
    def validate(self, password, user=None):
        try:
            super().validate(password, user)
        except ValidationError:
            raise ValidationError(
                "This password is too easy to guess. "
                "Please choose a more unique password.",
                code="password_too_common",
            ) from None


class CustomNumericPasswordValidator(NumericPasswordValidator):
    def validate(self, password, user=None):
        if password.isdigit():
            # Breaking the string into two lines fixes the 80-character limit
            raise ValidationError(
                "Your password cannot consist entirely of numbers. "
                "Please add some letters or symbols.",
                code="password_entirely_numeric",
            )
