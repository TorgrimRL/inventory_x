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
        self,
        response: Response,
        contract_map: dict[int, Any],
        expected_status: int,
    ) -> Any:
        """
        Strictly validates that the response matches the definition in
        contracts.py.

        Features:
        - Status Code Verification (does response match code you expected)
        - Contract Verification (does the response body match the schema for
        the received status code)

        Returns the validated data dict for further logic checks.
        """
        errors: list[str] = []

        if response.status_code != expected_status:
            errors.append(
                f"[Status Code] Expected {expected_status}, "
                f"but got {response.status_code}."
            )

        if response.status_code not in contract_map:
            allowed = list(contract_map.keys())
            errors.append(
                f"[Contract Missing] Status {response.status_code} is not "
                "defined in contract_map.\n"
                f"   Allowed statuses: {allowed}\n"
                f"   Response Body: {response.content.decode()}"
            )
            # Cannot proceed to validate the body if no schema is defined.
            self.fail("\n\n".join(errors))

        schema_entry = contract_map[response.status_code]

        if isinstance(schema_entry, OpenApiResponse):
            serializer_cls = schema_entry.response
        else:
            serializer_cls = schema_entry

        if serializer_cls is None:
            # expect an empty body
            if response.content:
                errors.append(
                    "[Body Mismatch] Expected empty body for status "
                    f"{response.status_code}, but got: "
                    f"{response.content.decode()}"
                )

        else:
            # Expect the body to be a certain format
            if isinstance(serializer_cls, type):
                # It's a normal uninstantiated class
                serializer = serializer_cls(data=response.data)
            elif hasattr(serializer_cls, "child"):
                # It's an instantiated ListSerializer
                serializer = serializer_cls.child.__class__(
                    data=response.data, many=True
                )
            else:
                # It's a standard instantiated serializer
                serializer = serializer_cls.__class__(data=response.data)

            if not serializer.is_valid():
                errors.append(
                    "[Schema Violation] Response for status "
                    f"{response.status_code} "
                    "failed validation against "
                    f"{serializer.__class__.__name__}.\n"
                    f"   Schema Errors: {serializer.errors}\n"
                    f"   Received Data: {response.data}"
                )

        if errors:
            self.fail(
                "\n" + "=" * 60 + "\n" + "\n\n".join(errors) + "\n" + "=" * 60
            )

        return response.data
