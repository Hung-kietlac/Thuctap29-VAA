from django.urls import path
from .views import register_user
from .views import login_user
from .views import send_otp
from .views import phim
from .views import rap
from .views import dichvu
from .views import generate_vnpay_qr
from .views import ticket_history, ticket_detail, cancel_ticket
from .views import (
    ticket_history, ticket_detail, cancel_ticket,
    delete_user, update_user, get_users, count_users, add_movie, get_movies, update_movie, delete_movie
)
from .views import get_movies, add_movie, update_movie, delete_movie, get_showtimes, add_showtime, delete_showtime


urlpatterns = [
    path('users/register_user/', register_user, name='register_user'),
    path('users/login_user/', login_user, name="login_user"),
    path('users/send_otp/', send_otp, name="send_otp"),
    path('phim/', phim, name="phim"),
    path('rap/', rap, name="rap"),
    path('dichvu/', dichvu, name="dichvu"),
    path("generate_qr/", generate_vnpay_qr, name="generate_vnpay_qr"),

    path('ticket-history/', ticket_history, name='ticket-history'),
    path('ticket_detail/<str:ticket_id>/', ticket_detail, name='ticket_detail'),
    path('cancel_ticket/<str:ticket_id>/', cancel_ticket, name='cancel+ticket'),
    path('get_ticket/<str:ticket_id>/', cancel_ticket, name='get_ticket'),

    path('users/delete/<str:user_id>/', delete_user, name='delete_user'),
    path('users/update/<str:user_id>/', update_user, name='update_user'),
    path('users/', get_users, name='get_users'),
    path('users/count/', count_users, name='count_users'),

    path("movies/", get_movies, name="get_movies"),  
    path("movies/add/", add_movie, name="add_movie"),  
    path("movies/update/<str:movie_id>/", update_movie, name="update_movie"),  
    path("movies/delete/<str:movie_id>/", delete_movie, name="delete_movie"),  

    path("showtimes/", get_showtimes, name="get_showtimes"),  
    path("showtimes/add/", add_showtime, name="add_showtime"),  
    path("showtimes/delete/<str:showtime_id>/", delete_showtime, name="delete_showtime"),
    
     
    
]