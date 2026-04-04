from api.common.serializers import serializers
from api.inventory.models import StockLog


class StockLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(
        source="performed_by.display_name", read_only=True
    )

    class Meta:
        model = StockLog
        exclude = (
            "id",
            "performed_by",
        )


class StockLogSerializerList(serializers.ListSerializer):
    child = StockLogSerializer()
