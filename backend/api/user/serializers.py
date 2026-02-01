from rest_framework import serializers


# --- Request Serializers ---
class LoginSerializer(serializers.Serializer):
    """Input schema for login requests."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# --- Response Serializers ---
class LoginResponseSerializer(serializers.Serializer):
    """Output schema for successful login."""

    username = serializers.CharField()


class LoginErrorDetailSerializer(serializers.Serializer):
    email = serializers.ListField(child=serializers.CharField(), required=False)
    password = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class LoginValidationErrorSerializer(serializers.Serializer):
    detail = LoginErrorDetailSerializer()


# --- Shared/Generic Serializers ---
class ErrorResponseSerializer(serializers.Serializer):
    """Format for 401 and 500 errors (simple string message)"""

    detail = serializers.CharField()


class ValidationErrorResponseSerializer(serializers.Serializer):
    """Format for 400 errors (contains validation dictionary)"""

    detail = serializers.DictField()


class VerifySessionResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    username = serializers.CharField()
