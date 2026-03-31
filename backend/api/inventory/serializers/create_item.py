from rest_framework import serializers


class InventoryItemCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    price = serializers.IntegerField(min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
    low_stock_threshold = serializers.IntegerField(
        min_value=0, required=False, allow_null=True
    )
    low_stock_notification = serializers.BooleanField(
        required=False, default=False
    )
