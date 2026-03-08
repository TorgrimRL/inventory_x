from drf_spectacular.utils import OpenApiResponse

from api.common.serializers import ErrorResponseSerializer
from api.user.serializers.verify import VerifySessionResponseSerializer

VERIFY_RESPONSES = {
    200: VerifySessionResponseSerializer,
    403: OpenApiResponse(
        response=ErrorResponseSerializer,
        description="Authentication credentials were not provided.",
    ),
}
