from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model

User = get_user_model()

@login_required
def home_view(request):
    usuario = {'usuario': request.user.username}
    return render(request, 'core/home.html', usuario)

@login_required
def listar_usuarios_view(request):
    usuarios = User.objects.all()
    return render(request, 'core/listar.html', {'usuarios': usuarios})

