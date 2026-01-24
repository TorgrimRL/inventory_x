from django.urls import path

from .views.login import login_handler

urlpatterns = [
    path("login/", login_handler, name="login"),
]
