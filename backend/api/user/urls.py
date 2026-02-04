from django.urls import path

from .views.login import LoginView
from .views.signup import SignupView
from .views.verify import VerifyView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("verify/", VerifyView.as_view(), name="verify"),
    path("signup/", SignupView.as_view(), name="signup"),
]
