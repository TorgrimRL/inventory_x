# api/inventory/serializers.py
from rest_framework import serializers


class RegisterInventoryRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    orgNumber = serializers.CharField(max_length=50, trim_whitespace=True)

    def validate_name(self, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Inventory name is required")
        return value

    def validate_orgNumber(self, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Organization number is required")
        return value


class RegisterInventoryResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    inventory = serializers.DictField()
    membership = serializers.DictField()
