from django.urls import path
from .views import register_user
from .views import login_user
from .views import send_otp
from .views import phim
from .views import rap
from .views import phim_sap_chieu
from .views import phim_dang_chieu

urlpatterns = [
    path('users/register_user/', register_user, name='register_user'),
    path('users/login_user/', login_user, name="login_user"),
    path('users/send_otp/', send_otp, name="send_otp"),
    path('phim/', phim, name="phim"),
    path('rap/', rap, name="rap"),
    path('api/phim-sap-chieu/', phim_sap_chieu, name='phim_sap_chieu'),
    path('api/phim-dang-chieu/', phim_dang_chieu, name='phim_dang_chieu'),
]