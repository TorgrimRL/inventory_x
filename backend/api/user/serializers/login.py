from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """Input schema for login requests."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


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
