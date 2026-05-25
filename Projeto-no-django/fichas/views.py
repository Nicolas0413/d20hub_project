import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required
from .models import Estatisticas, Ficha, Pericia, TreinamentoFichaPericia, Habilidade, Item, Ataque, Inventario

@login_required
def home_fichas_view(request):
    usuario = {'usuario': request.user.username}
    return render(request, 'fichas/home.html', usuario)

@login_required
def criar_ficha_view(request):
    if request.method == 'POST':
        ficha = Ficha.objects.create(usuario = request.user, nome="")
        Estatisticas.objects.create(ficha=ficha)
        Inventario.objects.create(ficha=ficha)
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
def editar_nome_ficha_view(request, ficha_id):  # Dps mudar para quando editar nome na outra tela, rodar o salvar direto e deleta isso
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
def salvar_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST':
        campospermidos = ["nome", "personagem", "foto_personagem", "nex", "classe", "trilha", "origem", "pericias", "patente", "anotacoes", "aparencia", "historia", "token_personagem", "estatisticas.forca", "estatisticas.agilidade", "estatisticas.vigor", "estatisticas.intelecto", "estatisticas.presenca", "estatisticas.pv_atual", "estatisticas.pv_maximos", "estatisticas.pe_atual", "estatisticas.pe_maximos", "estatisticas.sanidade_atual", "estatisticas.sanidade_maxima", "estatisticas.defesa", "estatisticas.esquiva", "estatisticas.bloqueio", "inventario.carga_atual", "inventario.carga_maxima", "inventario.cat1", "inventario.cat2", "inventario.cat3", "inventario.cat4"]
        dados = json.loads(request.body)
        campo = dados.get('campo')
        valor = dados.get('valor')
        if campo in campospermidos:
            if "." in campo: # Para campos relacionados" 
                relacao, campo = campo.split(".")
                objeto = getattr(ficha, relacao)
                setattr(objeto, campo, valor)
                objeto.save()
                return JsonResponse({"status": True})
            setattr(ficha, campo, valor)
            ficha.save()
            return JsonResponse({"status": True})
        return JsonResponse({"status": False, "mensagem": "Campo Invalido."})
    
@login_required
def detalhes_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/detalhes.html', {'ficha': ficha})
    
# Pericias CRUD

@login_required
def pericias_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/pericias.html', {'ficha': ficha})

@login_required
def criar_pericia_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST':
        pericia = Pericia.objects.create()
        TreinamentoFichaPericia.objects.create(ficha=ficha, pericia=pericia) 
        return JsonResponse({"status": True})
    
@login_required
def remover_pericia_view(request, pericia_id):
    pericia = get_object_or_404(Pericia, id=pericia_id)
    treinamento = get_object_or_404(TreinamentoFichaPericia, pericia=pericia, ficha__usuario=request.user)
    if request.method == 'POST':
        treinamento.delete()
        pericia.delete()
        return JsonResponse({"status": True})
    
@login_required
def salvar_pericia_view(request, pericia_id):
    pericia = get_object_or_404(Pericia, id=pericia_id)
    treinamento = get_object_or_404(TreinamentoFichaPericia, pericia=pericia, ficha__usuario=request.user)
    campos_permitidos = ["pericia.nome", "descricao", "pagina", "dados", "bonus", "treinamento"]
    if request.method == 'POST':
        dados = json.loads(request.body)
        campo = dados.get('campo')
        valor = dados.get('valor')
        if campo not in campos_permitidos:
            return JsonResponse({"status": False, "mensagem": "Campo invalido."})
        if campo in ["dados", "bonus"]:
            try:
                int_valor = int(valor)
                setattr(treinamento, campo, int_valor)
            except ValueError:
                return JsonResponse({"status": False, "mensagem": "Valor inválido para campo numérico."})
            treinamento.save()
            return JsonResponse({"status": True})
        
        if campo == "treinamento":
            setattr(treinamento, campo, valor)
            treinamento.save()
            return JsonResponse({"status": True})

        if "." in campo: # Para campo relacionado" 
            campo = "nome"
        setattr(pericia, campo, valor)
        pericia.save()
        return JsonResponse({"status": True})
    

# Habilidades CRUD

@login_required
def habilidades_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/habilidades.html', {'ficha': ficha})

@login_required
def criar_habilidade_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST':
        Habilidade.objects.create(ficha=ficha)
        return JsonResponse({"status": True})
    
@login_required
def remover_habilidade_view(request, habilidade_id):
    habilidade = get_object_or_404(Habilidade, id=habilidade_id, ficha__usuario=request.user)
    if request.method == 'POST':
        habilidade.delete()
        return JsonResponse({"status": True})
    
@login_required
def salvar_habilidade_view(request, habilidade_id):
    habilidade = get_object_or_404(Habilidade, id=habilidade_id, ficha__usuario=request.user)
    campos_permitidos = ["nome", "descricao", "pagina", "custo"]
    if request.method == 'POST':
        dados = json.loads(request.body)
        campo = dados.get('campo')
        valor = dados.get('valor')
        if campo not in campos_permitidos:
            return JsonResponse({"status": False, "mensagem": "Campo invalido."})
        setattr(habilidade, campo, valor)
        habilidade.save()
        return JsonResponse({"status": True})


# Inventário CRUD

@login_required
def inventario_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    return render(request, 'fichas/inventario.html', {'ficha': ficha})

@login_required
def criar_item_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST':
        Item.objects.create(inventario=ficha.inventario)
        return JsonResponse({"status": True})

@login_required
def remover_item_view(request, item_id):
    item = get_object_or_404(Item, id=item_id, inventario__ficha__usuario=request.user)
    if request.method == 'POST':
        item.delete()
        return JsonResponse({"status": True})

@login_required
def salvar_item_view(request, item_id):
    item = get_object_or_404(Item, id=item_id, inventario__ficha__usuario=request.user)
    campos_permitidos = ["nome", "categoria", "espaco", "descricao"]
    if request.method == 'POST':
        dados = json.loads(request.body)
        campo = dados.get('campo')
        valor = dados.get('valor')
        if campo not in campos_permitidos:
            return JsonResponse({"status": False, "mensagem": "Campo invalido."})
        setattr(item, campo, valor)
        item.save()
        return JsonResponse({"status": True})
    

