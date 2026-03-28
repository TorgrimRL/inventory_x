from typing import Any

from rest_framework import status

from api.common.serializers import ErrorResponseSerializer
from api.inventory.serializers.custom_field import (
    InventoryCustomFieldSerializer,
)

GET_CUSTOM_FIELDS_RESPONSES: dict[int, Any] = {
    status.HTTP_200_OK: InventoryCustomFieldSerializer(many=True),
}

CREATE_CUSTOM_FIELD_RESPONSES: dict[int, Any] = {
    status.HTTP_201_CREATED: InventoryCustomFieldSerializer,
    status.HTTP_400_BAD_REQUEST: ErrorResponseSerializer,
    status.HTTP_403_FORBIDDEN: ErrorResponseSerializer,
}

DELETE_CUSTOM_FIELD_RESPONSES: dict[int, Any] = {
    status.HTTP_204_NO_CONTENT: None,
    status.HTTP_403_FORBIDDEN: ErrorResponseSerializer,
    status.HTTP_404_NOT_FOUND: ErrorResponseSerializer,
}
