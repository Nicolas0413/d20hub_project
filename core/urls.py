from django.urls import path
from django.contrib import admin
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home_view, name='home'),
    path('listar/', views.listar_usuarios_view, name='listar_usuarios'),
    path('rolagens/', views.rolagens_view, name='rolagens'),
]