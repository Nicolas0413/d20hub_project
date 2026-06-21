from django.urls import path
from . import views

app_name = 'sessoes'

urlpatterns = [
    path('criar/', views.criar_sala, name='criar_sala'),
    path('entrar/', views.entrar_sala, name='entrar_sala'),
    path('sala/<str:codigo_sala>/', views.sala_rpg, name='sala_rpg'),
]