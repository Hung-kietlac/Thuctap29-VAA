from django.urls import path
from .views import register_user
from .views import login_user
from .views import send_otp
from .views import phim
from .views import rap
from .views import dichvu
from .views import generate_vnpay_qr

urlpatterns = [
    path('users/register_user/', register_user, name='register_user'),
    path('users/login_user/', login_user, name="login_user"),
    path('users/send_otp/', send_otp, name="send_otp"),
    path('phim/', phim, name="phim"),
    path('rap/', rap, name="rap"),
    path('dichvu/', dichvu, name="dichvu"),
    path("generate_qr/", generate_vnpay_qr, name="generate_vnpay_qr"),
]