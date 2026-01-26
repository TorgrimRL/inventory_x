from django.urls import path

from api.user.views.logout import LogoutView
from api.user.views.verify import VerifyView

from .views.login import LoginView

urlpatterns = [
    path("login/", LoginView.as_view(), nane="login"),
    path("logout/", LogoutView.as_view()),
    path("verify/", VerifyView.as_view()),
]
