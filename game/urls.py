from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_view, name='game'),
    path('save-score/', views.save_score, name='save_score'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
]