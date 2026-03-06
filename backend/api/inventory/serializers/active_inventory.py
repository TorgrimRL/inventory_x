from rest_framework import serializers


class SetActiveInventoryRequestSerializer(serializers.Serializer):
    inventory_id = serializers.UUIDField()


class ActiveInventoryResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    name = serializers.CharField()
    orgNumber = serializers.CharField()
    role = serializers.CharField()
