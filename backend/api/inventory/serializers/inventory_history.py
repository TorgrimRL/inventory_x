from api.common.serializers import serializers


class InventoryHistoryPointSerializer(serializers.Serializer):
    month = serializers.CharField()
    value = serializers.IntegerField()
