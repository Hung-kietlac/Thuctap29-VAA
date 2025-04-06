from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ( register_user, login_user, send_otp, phim, rap,
    dichvu,
    generate_vnpay_qr,
    ticket_history,
    ticket_detail,
    cancel_ticket,
    delete_user,
    update_user,
    get_users,
    count_users,
    get_movies,
    add_movie,
    update_movie,
    delete_movie,
    get_showtimes,
    add_showtime,
    delete_showtime,
    logout_user,
    user_list,
    user_detail,
    phongchieu,
    suatchieu,
    suatchieu_detail,
    ve, tickets_statistics,
    vnpay_return,
    du_lieu_thanh_toan,
)
from . import views


router = DefaultRouter()
router.register(r'phim', views.PhimViewSet)
router.register(r'suatchieu', views.SuatChieuViewSet)
router.register(r've', views.VeViewSet)
router.register(r'dichvu', views.DichVuViewSet)
router.register(r'rap', views.RapViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('users/register/', views.register_user, name='register_user'),
    path('users/login_user/', views.login_user, name='login_user'),
    path('users/logout_user/', views.logout_user, name='logout_user'),
    path('users/<int:pk>/', views.user_detail, name='user_detail'),
    path('users/send_otp/', send_otp, name="send_otp"),
    
    path('users/send_otp/', send_otp, name="send_otp"),
    path('phim/', phim, name="phim"),
    path('rap/', rap, name="rap"),
    path('dichvu/', dichvu, name="dichvu"),
    path('generate_vnpay_qr/', generate_vnpay_qr, name="generate_vnpay_qr"),
    path('vnpay-return/', vnpay_return, name='vnpay_return'),
    path('du_lieu_thanh_toan/', du_lieu_thanh_toan, name='du_lieu_thanh_toan'),

    path('phim/', views.phim, name='phim'),
    path('phim/<int:pk>/', views.phim, name='phim_detail'),
    path('suatchieu/', views.suatchieu, name='suatchieu'),
    path('suatchieu/<int:pk>/', views.suatchieu_detail, name='suatchieu_detail'),

    path('ve/', views.ve, name='ve'),
    path('ve/<int:pk>/', views.ve, name='ve_detail'),
    path('dichvu/', views.dichvu, name='dichvu'),
    path('dichvu/<int:pk>/', views.dichvu, name='dichvu_detail'),
    

    path('ticket-history/', ticket_history, name='ticket-history'),
    path('ticket_detail/<str:ticket_id>/', ticket_detail, name='ticket_detail'),
    path('cancel_ticket/<str:ticket_id>/', cancel_ticket, name='cancel_ticket'),
    path('tickets/statistics/', tickets_statistics, name='tickets_statistics'),

    path('users/', views.get_users, name='get_users'),
    path('users/delete/<str:user_id>/', views.delete_user, name='delete_user'),
    path('users/update/<str:user_id>/', views.update_user, name='update_user'),
    path('users/register_user/', views.register_user, name='register_user'),
    path('users/count/', views.count_users, name='count_users'),

    path("movies/", get_movies, name="get_movies"),  
    path("movies/add/", add_movie, name="add_movie"),  
    path("movies/update/<str:movie_id>/", update_movie, name="update_movie"),  
    path("movies/delete/<str:movie_id>/", delete_movie, name="delete_movie"),  


    path("showtimes/", get_showtimes, name="get_showtimes"),  
    path("showtimes/add/", add_showtime, name="add_showtime"),  
    path("showtimes/delete/<str:showtime_id>/", delete_showtime, name="delete_showtime"),
]