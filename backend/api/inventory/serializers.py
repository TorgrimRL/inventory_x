from rest_framework import serializers

from api.inventory.models import InventoryMembership, org_number_validator


class RegisterInventoryRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    orgNumber = serializers.CharField(
        max_length=9,
        min_length=9,
        trim_whitespace=True,
        validators=[org_number_validator],
    )


class RegisterInventoryResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    id = serializers.UUIDField()


class ErrorResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()


class RegisterInventoryErrorDetailSerializer(serializers.Serializer):
    name = serializers.ListField(child=serializers.CharField(), required=False)
    orgNumber = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class RegisterInventoryValidationErrorSerializer(serializers.Serializer):
    detail = RegisterInventoryErrorDetailSerializer()


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


class InventoryListSerializer(serializers.Serializer):
    data = InventoryItemCreateSerializer(many=True)


class UserInventoryListItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="inventory.id", read_only=True)
    name = serializers.CharField(source="inventory.name", read_only=True)
    orgNumber = serializers.CharField(
        source="inventory.org_number", read_only=True
    )

    class Meta:
        model = InventoryMembership
        fields = ("id", "name", "orgNumber", "role")


class UserInventoryListSerializer(serializers.ListSerializer):
    child = UserInventoryListItemSerializer()


class InventoryItemUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    price = serializers.IntegerField(min_value=0)


class InviteUserRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
