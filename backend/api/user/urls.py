from django.urls import path

from api.user.views.logout import LogoutView

from .views.login import LoginView
from .views.password_reset import PasswordResetView
from .views.signup import SignupView
from .views.verify import VerifyView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("verify/", VerifyView.as_view(), name="verify"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("password_reset", PasswordResetView.as_view(), name="password_reset"),
]
