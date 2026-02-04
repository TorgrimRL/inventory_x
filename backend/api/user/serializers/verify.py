from rest_framework import serializers


class VerifySessionResponseSerializer(serializers.Serializer):
    detail = serializers.CharField()
    username = serializers.CharField()
