from rest_framework import serializers


class ErrorResponseSerializer(serializers.Serializer):
    """Format for 401 and 500 errors (simple string message)"""

    detail = serializers.CharField()


class ValidationErrorResponseSerializer(serializers.Serializer):
    """Format for 400 errors (contains validation dictionary)"""

    detail = serializers.DictField()
