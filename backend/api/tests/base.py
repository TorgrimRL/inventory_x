from typing import Any

from drf_spectacular.utils import OpenApiResponse
from rest_framework.response import Response
from rest_framework.test import APITestCase

from api.user.models import User


class BaseAPITestCase(APITestCase):
    """
    The Single Source of Truth for all API testing.
    Provides contract enforcement, user factories, and typed helpers.
    """

    def create_user(
        self,
        email: str = "user@test.com",
        password: str = "password",
        **kwargs: Any,
    ) -> User:
        return User.objects.create_user(
            email=email, password=password, **kwargs
        )

    def assert_contract(
        self, response: Response, contract_map: dict[int, Any]
    ) -> dict[str, Any]:
        """
        Strictly validates that the response matches the definition in
        contracts.py.
        Returns the validated data dict for further logic checks.
        """
        schema_entry = contract_map.get(response.status_code)
        if not schema_entry:
            allowed = list(contract_map.keys())
            self.fail(
                f"Status {response.status_code} is NOT in the contract. "
                f"Allowed: {allowed}. Body: {response.content.decode()}"
            )

        if isinstance(schema_entry, OpenApiResponse):
            serializer_cls = schema_entry.response
        else:
            serializer_cls = schema_entry

        if serializer_cls is None:
            if response.content:
                self.fail(
                    f"Expected empty body, got {response.content.decode()}"
                )
            return {}

        data = response.data
        serializer = serializer_cls(data=data)

        if not serializer.is_valid():
            self.fail(
                f"Contract Violated! {serializer_cls.__name__} mismatch.\n"
                f"Errors: {serializer.errors}\n"
                f"Data: {data}"
            )

        return serializer.validated_data
