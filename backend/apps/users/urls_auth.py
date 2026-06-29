from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views_auth import (
    LoginView,
    LogoutView,
    MeView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    RegisterView,
    Verify2FAView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("2fa/verify/", Verify2FAView.as_view(), name="verify_2fa"),
    path("me/", MeView.as_view(), name="me"),
    path("password/reset/", PasswordResetRequestView.as_view(), name="password_reset"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]