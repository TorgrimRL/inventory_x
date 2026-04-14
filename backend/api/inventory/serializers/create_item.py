from rest_framework import serializers


class InventoryItemCreateSerializer(serializers.Serializer):
    id = serializers.UUIDField(read_only=True, required=False)
    name = serializers.CharField(max_length=255)
    price = serializers.IntegerField(min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
    category_ids = serializers.ListField(
        child=serializers.UUIDField(), required=False, default=list
    )
    low_stock_threshold = serializers.IntegerField(
        min_value=0, required=False, allow_null=True
    )
    low_stock_notification = serializers.BooleanField(
        required=False, default=False
    )
    image = serializers.ImageField(required=False, allow_null=True)
    image_url = serializers.CharField(read_only=True, allow_null=True)
