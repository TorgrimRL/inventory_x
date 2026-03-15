from rest_framework import serializers


class InventoryItemCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    price = serializers.IntegerField(min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )
