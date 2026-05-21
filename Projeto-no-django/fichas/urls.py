from django.urls import path
from . import views

app_name = 'fichas'

urlpatterns = [
    path('', views.home_fichas_view, name='home'),
    path('criar/', views.criar_ficha_view, name='criar_ficha'),
    path('limpar/', views.limpar_fichas_view, name='limpar_fichas'),
    path('usuario/', views.fichas_usuario_view, name='fichas_usuario'),

    path('<int:ficha_id>/', views.ler_ficha_view, name='ler_ficha'),
    path('<int:ficha_id>/editar/nome/', views.editar_nome_ficha_view, name='editar_nome_ficha'),
    path('<int:ficha_id>/excluir/', views.excluir_ficha_view, name='excluir_ficha'),
    
    path('<int:ficha_id>/pericias/', views.pericias_ficha_view, name='pericias_ficha'),
    path('<int:ficha_id>/pericias/criar', views.criar_pericia_view, name='criar_pericia'),
    path('<int:ficha_id>/pericias/salvar', views.salvar_pericia_view, name='salvar_pericia'),



    path('<int:ficha_id>/habilidades/', views.habilidades_ficha_view, name='habilidades_ficha'),
    path('<int:ficha_id>/inventario/', views.inventario_ficha_view, name='inventario_ficha'),
    path('<int:ficha_id>/detalhes/', views.detalhes_ficha_view, name='detalhes_ficha'),
    path('<int:ficha_id>/salvar/', views.salvar_ficha_view, name='salvar_ficha'),
]