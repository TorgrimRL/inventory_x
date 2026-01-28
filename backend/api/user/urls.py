from django.urls import path

from api.user.views.logout import LogoutView

from .views.login import LoginView
from .views.verify import VerifyView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("verify/", VerifyView.as_view(), name="verify"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
