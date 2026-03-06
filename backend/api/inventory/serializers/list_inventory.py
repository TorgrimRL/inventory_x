from rest_framework import serializers

from api.inventory.models import InventoryMembership
from api.inventory.serializers.create_item import InventoryItemCreateSerializer


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
