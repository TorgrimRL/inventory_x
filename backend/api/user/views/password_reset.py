import logging
import secrets

from adrf.views import APIView
from asgiref.sync import sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.core.mail import send_mail
from django.template.loader import render_to_string
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from api.user.contracts.password_reset import (
    PASSOWORD_RESET_RESPONSES_POST,
    PASSWORD_RESET_PARAMS_POST,
    PASSWORD_RESET_RESPONSES_PUT,
)
from api.user.serializers.password_reset import PasswordResetConfirmSerializer
from config import settings

logger = logging.getLogger(__name__)
User = get_user_model()


class PasswordResetView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        summary="Send reset password link",
        description="Send one time code (OTC) to client. \
        Expects URL: /password_reset?email=user@example.com",
        request=None,
        responses=PASSOWORD_RESET_RESPONSES_POST,
        parameters=PASSWORD_RESET_PARAMS_POST,
    )
    async def post(self, request: Request) -> Response:
        # Validating email exists
        email = request.query_params.get("email")
        if not email:
            return Response(status=400)

        elif not await User.objects.filter(email=email).aexists():
            return Response(status=200)

        return await self.__send_otc_to(email)

    @extend_schema(
        summary="Password reset",
        request=PasswordResetConfirmSerializer,
        responses=PASSWORD_RESET_RESPONSES_PUT,
        parameters=None,
    )
    async def put(self, request: Request) -> Response:
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        otc = serializer.validated_data["OTC"]
        new_password = serializer.validated_data["NEW_PASSWORD"]

        try:
            user_mail = await cache.aget(otc)
            user = await User.objects.aget(email=user_mail)
            user.set_password(new_password)
            await user.asave()
            await sync_to_async(cache.delete)(otc)

            return Response(status=200)

        except User.DoesNotExist:
            return Response(status=404)

    async def __send_otc_to(self, mail: str) -> Response:
        """
        PRIVATE METHOD:
        send reset link with one time use code.
        """
        otc = secrets.token_hex(32)  # 32 bytes
        await cache.aset(otc, mail, timeout=60 * 5)  # 5min lifetime.
        reset_link = f"{settings.HOST_ENDPOINT}/password_reset?token={otc}"

        mail_content = render_to_string(
            "reset_password.txt", {"link": reset_link}
        )
        logging.debug(mail_content)

        # Spawn a new thead to process the mailing.
        async_send_mail = sync_to_async(send_mail, thread_sensitive=False)
        try:
            await async_send_mail(
                subject="Reset Password",
                message=mail_content,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[mail],
                fail_silently=False,
            )

        except Exception as e:
            logging.error(f"Mail Service Failed: {e}")

        return Response(status=status.HTTP_200_OK)
