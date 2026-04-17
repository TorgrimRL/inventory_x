import uuid
from typing import Any

from rest_framework import serializers

from api.inventory.context import get_active_inventory_id
from api.inventory.models import InventoryCustomField


class InventoryItemUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    price = serializers.IntegerField(min_value=0)
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )
    low_stock_threshold = serializers.IntegerField(
        min_value=0, required=False, allow_null=True
    )
    custom_fields = serializers.JSONField(required=False)
    low_stock_notification = serializers.BooleanField(required=False)
    image = serializers.ImageField(required=False, allow_null=True)
    remove_image = serializers.BooleanField(required=False, default=False)

    def validate_custom_fields(self, value: dict[str, Any]) -> dict[str, Any]:
        if not value:
            return value

        request = self.context.get("request")
        if not request:
            return value

        inventory_id = get_active_inventory_id(request)
        if not inventory_id:
            return value

        valid_field_ids = set(
            InventoryCustomField.objects.filter(
                inventory_id=inventory_id
            ).values_list("id", flat=True)
        )

        for field_id_str in value:
            try:
                field_id = uuid.UUID(field_id_str)
            except ValueError as e:
                raise serializers.ValidationError(
                    f"Custom field ID {field_id_str} is not a valid UUID."
                ) from e

            if field_id not in valid_field_ids:
                raise serializers.ValidationError(
                    f"Custom field ID {field_id_str} does not exist for this "
                    "inventory."
                )

        return value
