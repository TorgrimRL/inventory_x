from rest_framework import serializers

from api.inventory.models import InventoryCustomField, InventoryItem


class InventoryCustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCustomField
        fields = ("id", "name", "data_type", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_name(self, value: str) -> str:
        """
        Prevent creating custom fields that share a name with
        hard-coded InventoryItem fields to avoid frontend/backend collisions.
        """
        # Get all standard field names from the item model
        standard_fields = {
            f.name.lower() for f in InventoryItem._meta.get_fields()
        }

        if value.lower() in standard_fields:
            raise serializers.ValidationError(
                f"A standard field with the name '{value}' already exists. "
                "Please choose a different name."
            )
        return value
