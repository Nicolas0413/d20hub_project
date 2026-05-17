import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required
from .models import Estatisticas, Ficha

@login_required
def home_fichas_view(request):
    usuario = {'usuario': request.user.username}
    return render(request, 'fichas/home.html', usuario)

@login_required
def criar_ficha_view(request):
    if request.method == 'POST':
        ficha = Ficha.objects.create(usuario = request.user, nome="")
        Estatisticas.objects.create(ficha=ficha)
        return JsonResponse({"id": ficha.id, "nome": ficha.nome, "status": True})
    
@login_required
def limpar_fichas_view(request):
    if request.method == 'POST':
        Ficha.objects.filter(usuario=request.user).delete()
        return JsonResponse({"status": True})

@login_required
def excluir_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id)
    if request.method == 'POST':
            ficha.delete()
            return JsonResponse({"status": True})

@login_required
def editar_nome_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id)
    if request.method == 'POST':
        dados = json.loads(request.body)
        ficha.nome = dados.get('nome')
        ficha.save()
        return JsonResponse({"status": True})
    
@login_required
def fichas_usuario_view(request):
    fichas = Ficha.objects.filter(usuario=request.user)
    vetor_fichas = [{"id": ficha.id, "nome": ficha.nome} for ficha in fichas]
    return JsonResponse(vetor_fichas, safe=False, status=200)

@login_required
def ler_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/ficha.html', {'ficha': ficha})

@login_required
def pericias_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/pericias.html', {'ficha': ficha})

@login_required
def habilidades_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/habilidades.html', {'ficha': ficha})

@login_required
def inventario_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/inventario.html', {'ficha': ficha})

@login_required
def detalhes_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/detalhes.html', {'ficha': ficha})

@login_required
def salvar_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST':
        camposproibidos = ["id", "usuario_id"]
        dados = json.loads(request.body)
        campo = dados.get('campo')
        valor = dados.get('valor')
        if campo in camposproibidos:
            return JsonResponse({"status": False, "mensagem": "Campo proibido."})
        if "." in campo: # Para campos relacionados" 
            relacao, campo = campo.split(".")
            objeto = getattr(ficha, relacao)
            setattr(objeto, campo, valor)
            objeto.save()
            return JsonResponse({"status": True})
        setattr(ficha, campo, valor)
        ficha.save()
        return JsonResponse({"status": True})