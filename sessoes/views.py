from django.contrib import messages
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from sessoes.models import Sala
from fichas.models import Ficha

@login_required
def criar_sala(request):
    sala = Sala.objects.create(mestre=request.user)
    return redirect('sessoes:sala_rpg', codigo_sala=sala.codigo)

@login_required
def entrar_sala(request):
    if request.method == "POST":
        codigo = request.POST.get("codigo").strip().upper()
        
        if Sala.objects.filter(codigo=codigo).exists():
            return redirect('sessoes:sala_rpg', codigo_sala=codigo)
        else:
            messages.error(request, "Código de sala inválido ou inexistente!")
            
    return render(request, 'sessoes/entrar_sala.html')

@login_required
def sala_rpg(request, codigo_sala):
    sala = get_object_or_404(Sala, codigo=codigo_sala)
    minhas_fichas = Ficha.objects.filter(usuario=request.user) 
    
    return render(request, 'sessoes/sala_rpg.html', {
        'sala': sala,
        'minhas_fichas': minhas_fichas
    })