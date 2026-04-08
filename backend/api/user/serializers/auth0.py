from rest_framework import serializers


class Auth0CallbackSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    provider_id = serializers.CharField(required=True)
    display_name = serializers.CharField(required=False, allow_blank=True)


class Auth0ResponseSerializer(serializers.Serializer):
    username = serializers.CharField()


class Auth0ErrorDetailSerializer(serializers.Serializer):
    email = serializers.ListField(child=serializers.CharField(), required=False)
    provider_id = serializers.ListField(
        child=serializers.CharField(), required=False
    )
    display_name = serializers.ListField(
        child=serializers.CharField(), required=False
    )


class Auth0ValidationErrorSerializer(serializers.Serializer):
    detail = Auth0ErrorDetailSerializer()
