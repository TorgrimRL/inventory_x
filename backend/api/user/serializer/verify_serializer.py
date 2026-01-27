# 1. Serializer Definition
from rest_framework import serializers


class VerifySessionResponseSerializer(serializers.Serializer):
    detail = serializers.CharField(example="Session is valid")
    username = serializers.CharField(example="johndoe")
