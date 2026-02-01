from rest_framework import serializers


class RegisterInventoryRequestSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, trim_whitespace=True)
    orgNumber = serializers.CharField(max_length=50, trim_whitespace=True)


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
