from django.urls import path
from . import views

app_name = 'sessoes'

urlpatterns = [
    path('criar/', views.criar_sala, name='criar_sala'),
    path('entrar/', views.entrar_sala, name='entrar_sala'),
    path('sala/<str:codigo_sala>/', views.sala_rpg, name='sala_rpg'),
    path('selecionar_ficha/', views.selecionar_ficha, name='selecionar_ficha'),
    path('carregar_ficha/<int:ficha_id>/<str:sala_codigo>/', views.carregar_ficha, name='carregar_ficha'),
    path('remover_ficha/<int:ficha_id>/<str:sala_codigo>/', views.remover_ficha, name='remover_ficha'),
    path('jogadores-sala/', views.jogadores_sala, name='jogadores_sala'),
    path('tornar-mestre/', views.tornar_mestre, name='tornar_mestre'),
]