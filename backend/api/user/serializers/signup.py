from typing import Any, ClassVar

from rest_framework import serializers

from api.user.models import User


class SignupSerializer(serializers.ModelSerializer):
    """Input schema for signup requests."""

    class Meta:
        model = User
        fields: ClassVar[list[str]] = ["email", "password", "display_name"]
        extra_kwargs: ClassVar[dict[str, Any]] = {
            "password": {"write_only": True},
            "display_name": {"required": False},
        }

    def create(self, validated_data: Any) -> User:
        return User.objects.create_user(**validated_data)


class SignupErrorDetailSerializer(serializers.Serializer):
    email = serializers.ListField(child=serializers.CharField(), required=False)
    password = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class SignupValidationErrorSerializer(serializers.Serializer):
    detail = SignupErrorDetailSerializer()
