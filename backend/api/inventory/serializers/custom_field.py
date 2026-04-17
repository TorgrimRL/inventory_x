from typing import Any

from rest_framework import serializers

from api.inventory.models import InventoryCustomField, InventoryItem


class InventoryCustomFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryCustomField
        fields = ("id", "name", "data_type", "created_at")
        read_only_fields = ("id", "created_at")

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        """
        Object-level validation allows us to return a top-level 'detail' key
        instead of DRF forcing it under the 'name' key.
        """
        name = attrs.get("name")

        if name:
            # Get all standard field names from the item model
            standard_fields = {
                f.name.lower() for f in InventoryItem._meta.get_fields()
            }

            if name.lower() in standard_fields:
                raise serializers.ValidationError(
                    {
                        "detail": {
                            "name": [
                                f"A standard field with the name '{name}' "
                                "already exists. Please choose a different "
                                "name."
                            ]
                        }
                    }
                )

        return attrs
