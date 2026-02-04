from rest_framework import serializers


class AdjustStockSerializer(serializers.Serializer):
    direction = serializers.ChoiceField(choices=["increase", "decrease"])
    amount = serializers.IntegerField(min_value=1)


class AdjustStockResponseSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    stock = serializers.IntegerField()
    message = serializers.CharField()


class InventoryItemCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    price = serializers.IntegerField(min_value=0)
    stock = serializers.IntegerField(min_value=0, required=False, default=0)
