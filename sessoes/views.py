from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from sessoes.models import Sala, FichaSessao
from fichas.models import Ficha
from fichas.views import checar_permissao
import json
from asgiref.sync import async_to_sync
from contas.models import User
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from .models import JogadorExpulso

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
    if JogadorExpulso.objects.filter(
        jogador=request.user,
        sala=sala
    ).exists():
        return redirect('core:home')
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

def jogadores_sala(request):
    codigo_sala = request.GET.get('codigo_sala')
    sala = Sala.objects.get(codigo=codigo_sala)

    jogadores = [
        {
            'usuario': sala.mestre,
            'role': 'Mestre'
        }
    ]

    for jogador in sala.jogadores.all():
        if jogador != sala.mestre:
            jogadores.append({
                'usuario': jogador,
                'role': 'jogador'
            })

    return render(request, 'sessoes/jogadores_sala.html', {
        'jogadores': jogadores,
    })

def tornar_mestre(request):
    if request.method != 'POST':
        return JsonResponse({
            'status': False,
            'mensagem': 'Método inválido.'
        })

    data = json.loads(request.body)

    jogador_id = data.get('jogador_id')
    codigo_sala = data.get('codigo_sala')

    sala = Sala.objects.get(codigo=codigo_sala)
    jogador = User.objects.get(id=jogador_id)

    sala.mestre = jogador
    sala.save()

    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f'sala_{codigo_sala}',
        {
            'type': 'mestre_atualizado',
            'mestre_id': jogador.id,
        }
    )

    return JsonResponse({
        'status': True
    })

@login_required
def carregar_ficha(request, ficha_id, sala_codigo):
    ficha = get_object_or_404(Ficha, id=ficha_id)
    sala = get_object_or_404(Sala, codigo=sala_codigo)

    FichaSessao.objects.get_or_create(
        ficha=ficha,
        sala=sala,
        defaults={'jogador': ficha.usuario}
    )

    if request.user == ficha.usuario:
        pode_ver = True

    elif ficha.visibilidade == 3:
        pode_ver = True

    elif ficha.visibilidade == 2:
        pode_ver = sala.jogadores.filter(
            id=request.user.id
        ).exists()

    elif ficha.visibilidade == 1:
        pode_ver = request.user == sala.mestre

    else:
        pode_ver = False

    return render(request, 'sessoes/carregar_fichas.html', {
        'ficha': ficha,
        'pode_ver': pode_ver,
    })

@login_required
def remover_ficha(request, ficha_id, sala_codigo):
    if request.method != "POST":
        return JsonResponse({"status": False, "mensagem": "Método inválido"}, status=405)

    ficha = get_object_or_404(Ficha, id=ficha_id)
    sala = get_object_or_404(Sala, codigo=sala_codigo)
    FichaSessao.objects.filter(ficha=ficha, jogador=request.user, sala=sala).delete()
    return JsonResponse({"status": True})