from rest_framework import serializers

from api.inventory.models import InventoryMembership


class InventoryMemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = InventoryMembership
        fields = (
            "id",
            "email",
            "role",
        )
