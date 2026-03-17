from api.common.serializers import serializers
from api.inventory.models import StockLog


class StockLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLog
        exclude = (
            "id",
            "inventory",
            "performed_by",
        )


class StockLogSerializerList(serializers.ListSerializer):
    child = StockLogSerializer()
