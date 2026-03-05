from rest_framework import serializers


class InviteUserRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
