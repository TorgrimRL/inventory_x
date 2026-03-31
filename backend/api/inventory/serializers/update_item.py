from rest_framework import serializers


class InventoryItemUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    price = serializers.IntegerField(min_value=0)
    low_stock_threshold = serializers.IntegerField(
        min_value=0, required=False, allow_null=True
    )
    low_stock_notification = serializers.BooleanField(required=False)
