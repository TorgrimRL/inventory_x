from rest_framework import serializers

from api.inventory.models import org_number_validator


class RegisterInventoryRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    orgNumber = serializers.CharField(
        max_length=9,
        min_length=9,
        trim_whitespace=True,
        validators=[org_number_validator],
    )


class RegisterInventoryResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    id = serializers.UUIDField()


class RegisterInventoryErrorDetailSerializer(serializers.Serializer):
    name = serializers.ListField(child=serializers.CharField(), required=False)
    orgNumber = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class RegisterInventoryValidationErrorSerializer(serializers.Serializer):
    detail = RegisterInventoryErrorDetailSerializer()
