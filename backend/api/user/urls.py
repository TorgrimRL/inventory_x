from django.urls import path

from api.user.views.verify import VerifyView

from .views.login import LoginView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("verify/", VerifyView.as_view()),
]
