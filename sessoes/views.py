from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from sessoes.models import Sala, FichaSessao
from fichas.models import Ficha
from fichas.views import checar_permissao

@login_required
def criar_sala(request):
    sala = Sala.objects.create(mestre=request.user)
    return redirect('sessoes:sala_rpg', codigo_sala=sala.codigo)

@login_required
def entrar_sala(request):
    if request.method != "POST":
        return render(request, 'sessoes/entrar_sala.html')

    codigo = request.POST.get("codigo", "").strip().upper()

    if Sala.objects.filter(codigo=codigo).exists():
        sala = Sala.objects.get(codigo=codigo)
        return redirect('sessoes:sala_rpg', codigo_sala=codigo)

    messages.error(request, "Código de sala inválido ou inexistente!")
    return render(request, 'sessoes/entrar_sala.html')

@login_required
def sala_rpg(request, codigo_sala):
    sala = get_object_or_404(Sala, codigo=codigo_sala)
    minhas_fichas = Ficha.objects.filter(usuario=request.user) 
    sala.jogadores.add(request.user) 
    fichas_sessao = FichaSessao.objects.filter(sala=sala)
    return render(request, 'sessoes/sala_rpg.html', {'sala': sala, 'minhas_fichas': minhas_fichas, 'fichas_sessao': fichas_sessao})

@login_required
def selecionar_ficha(request):
    codigo_sala = request.GET.get('codigo_sala')
    minhas_fichas = Ficha.objects.filter(usuario=request.user)

    if codigo_sala:
        fichas_ja_na_sala = FichaSessao.objects.filter(sala__codigo=codigo_sala).values_list('ficha_id', flat=True)
        minhas_fichas = minhas_fichas.exclude(id__in=fichas_ja_na_sala)

    fichas = [(ficha.id, ficha.nome) for ficha in minhas_fichas]
    return render(request, 'sessoes/selecionar_ficha.html', {
        'fichas': fichas
    })

@login_required
def carregar_ficha(request, ficha_id, sala_codigo):
    ficha = get_object_or_404(Ficha, id=ficha_id)
    sala = get_object_or_404(Sala, codigo=sala_codigo)
    FichaSessao.objects.get_or_create(ficha=ficha, sala=sala, defaults={'jogador': request.user})
    pode_ver = checar_permissao(request, ficha, 'visibilidade')
    return render(request, 'sessoes/carregar_fichas.html', {'ficha': ficha, 'pode_ver': pode_ver})

@login_required
def remover_ficha(request, ficha_id, sala_codigo):
    if request.method != "POST":
        return JsonResponse({"status": False, "mensagem": "Método inválido"}, status=405)

    ficha = get_object_or_404(Ficha, id=ficha_id)
    sala = get_object_or_404(Sala, codigo=sala_codigo)
    FichaSessao.objects.filter(ficha=ficha, jogador=request.user, sala=sala).delete()
    return JsonResponse({"status": True})