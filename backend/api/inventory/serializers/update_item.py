from rest_framework import serializers


class InventoryItemUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    price = serializers.IntegerField(min_value=0)
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )
