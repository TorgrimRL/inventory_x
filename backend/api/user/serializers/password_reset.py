from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            name="Valid Request Example",
            value={
                "OTC": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca49599"
                "1b7852b855",
                "NEW_PASSWORD": "StrongPassword123!",
            },
            request_only=True,
        )
    ]
)
class PasswordResetConfirmSerializer(serializers.Serializer):
    OTC = serializers.CharField(
        help_text="The One-Time Code received via email.",
        min_length=64,
        max_length=64,
        error_messages={
            "required": "We need the One-Time Code to verify your request.",
            "blank": "The One-Time Code cannot be empty.",
        },
    )
    NEW_PASSWORD = serializers.CharField(
        min_length=8,
        style={"input_type": "password"},
        error_messages={
            "required": "Please enter a new password.",
            "blank": "Your new password cannot be empty.",
            "min_length": "Password must be at least 8 characters long.",
        },
    )

    def validate(self, value: str) -> str:
        # This automatically runs Django's built-in password validators
        validate_password(value)
        return value
