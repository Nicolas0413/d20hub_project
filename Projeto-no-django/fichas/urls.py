from django.urls import path
from . import views

app_name = 'fichas'

urlpatterns = [
    path('', views.home_fichas_view, name='home'),
    path('criar/', views.criar_ficha_view, name='criar_ficha'),
    path('limpar/', views.limpar_fichas_view, name='limpar_fichas'),
    path('usuario/', views.fichas_usuario_view, name='fichas_usuario'),

    path('<int:ficha_id>/ficha/', views.ler_ficha_view, name='ler_ficha'),
    path('<int:ficha_id>/ficha/excluir/', views.excluir_ficha_view, name='excluir_ficha'),
    path('<int:ficha_id>/ficha/salvar/', views.salvar_ficha_view, name='salvar_ficha'),
    path('<int:ficha_id>/ficha/salvar/foto/', views.salvar_foto_ficha_view, name='salvar_foto_ficha'),
    path('<int:ficha_id>/ficha/salvar/token/', views.salvar_token_ficha_view, name='salvar_token_ficha'),

    path('<int:ficha_id>/ataque/criar/', views.criar_ataque_view, name='criar_ataque'),
    path('<int:ataque_id>/ataque/salvar/', views.salvar_ataque_view, name='salvar_ataque'),
    path('<int:ataque_id>/ataque/remover/', views.remover_ataque_view, name='remover_ataque'),

    path('<int:ficha_id>/pericias/', views.pericias_ficha_view, name='pericias_ficha'),
    path('<int:ficha_id>/pericia/criar/', views.criar_pericia_view, name='criar_pericia'),
    path('<int:pericia_id>/pericia/salvar/', views.salvar_pericia_view, name='salvar_pericia'),
    path('<int:pericia_id>/pericia/remover/', views.remover_pericia_view, name='remover_pericia'),


    path('<int:ficha_id>/habilidades/', views.habilidades_ficha_view, name='habilidades_ficha'),
    path('<int:ficha_id>/habilidade/criar/', views.criar_habilidade_view, name='criar_habilidade'),
    path('<int:habilidade_id>/habilidade/salvar/', views.salvar_habilidade_view, name='salvar_habilidade'),
    path('<int:habilidade_id>/habilidade/remover/', views.remover_habilidade_view, name='remover_habilidade'),


    path('<int:ficha_id>/inventario/', views.inventario_ficha_view, name='inventario_ficha'),
    path('<int:ficha_id>/item/criar/', views.criar_item_view, name='criar_item'),
    path('<int:item_id>/item/salvar/', views.salvar_item_view, name='salvar_item'),
    path('<int:item_id>/item/remover/', views.remover_item_view, name='remover_item'),

    path('<int:ficha_id>/detalhes/', views.detalhes_ficha_view, name='detalhes_ficha'),

    path('<int:ficha_id>/ficha/limpar/', views.limpar_ficha_view, name='limpar_ficha'),
    path('<int:ficha_id>/ficha/importar/', views.importar_view, name='importar_ficha'),
    path('<int:ficha_id>/ficha/exportar/', views.exportar_view, name='exportar_ficha'),
]