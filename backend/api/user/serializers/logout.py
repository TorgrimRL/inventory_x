from rest_framework import serializers


class LogoutResSerializer(serializers.Serializer):
    detail = serializers.CharField()
