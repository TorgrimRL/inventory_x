from rest_framework import serializers


class Auth0CallbackSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    state = serializers.CharField(required=True)


class Auth0ErrorDetailSerializer(serializers.Serializer):
    code = serializers.ListField(child=serializers.CharField(), required=False)
    state = serializers.ListField(child=serializers.CharField(), required=False)


class Auth0ValidationErrorSerializer(serializers.Serializer):
    detail = Auth0ErrorDetailSerializer()
