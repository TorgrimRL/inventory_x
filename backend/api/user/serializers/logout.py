from rest_framework import serializers


class LogoutResSerializer(serializers.Serializer):
    detail = serializers.CharField()
    logout_url = serializers.URLField(required=False, allow_null=True)
