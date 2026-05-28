from django.http import JsonResponse
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
import random
import json

User = get_user_model()

@login_required
def home_view(request):
    usuario = {'usuario': request.user.username}
    return render(request, 'core/home.html', usuario)

@login_required
def listar_usuarios_view(request):
    usuarios = User.objects.all()
    return render(request, 'core/listar.html', {'usuarios': usuarios})

@login_required
def rolagens_view(request):
    if request.method == 'POST':
        resultados = []
        infos = json.loads(request.body)
        quantidade = int(infos.get('quantidade'))
        lados = int(infos.get('lados'))
        bonus = int(infos.get('bonus'))
        maior = 0
        menor = 0
        soma = 0
        for _ in range(quantidade):
            resultado = random.randint(1, lados)
            resultados.append(resultado)
            if resultado > maior:
                maior = resultado
            if resultado < menor or menor == 0:
                menor = resultado
        soma = sum(resultados) + bonus
        return JsonResponse({'resultados': resultados, 'maior': maior, 'menor': menor, 'soma': soma})



    


