import json
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404, render
from django.contrib.auth.decorators import login_required
from .models import Estatisticas, Ficha, Pericia, Habilidade, Item, Ataque, Inventario
from django.core.serializers.json import DjangoJSONEncoder

# Dicts uteis

Modelos = {
    "ficha": Ficha,
    "habilidade": Habilidade,
    "ataque": Ataque,
    "pericia": Pericia,
    "item": Item
}

Paginas = {
    "detalhes": "detalhes.html",
    "ficha": "ficha.html",
    "habilidades": "habilidades.html",
    "home": "home.html",
    "inventario": "inventario.html",
    "pericias": "pericias.html"
}

Campos_Permitidos = {
    "ficha": ["nome", "personagem", "foto_personagem", "nex", "classe", "trilha", "origem", "patente", "anotacoes", "aparencia", "historia", "token_personagem", "estatisticas.forca", "estatisticas.agilidade", "estatisticas.vigor", "estatisticas.intelecto", "estatisticas.presenca", "estatisticas.pv_atual", "estatisticas.pv_maximos", "estatisticas.pe_atual", "estatisticas.pe_maximos", "estatisticas.sanidade_atual", "estatisticas.sanidade_maxima", "estatisticas.defesa", "estatisticas.esquiva", "estatisticas.bloqueio", "inventario.carga_atual", "inventario.carga_maxima", "inventario.cat1", "inventario.cat2", "inventario.cat3", "inventario.cat4"],
    "ataque": ["nome", "dano", "critico"],
    "pericia": ["nome", "descricao", "pagina", "dados", "bonus", "treinamento"],
    "habilidade": ["nome", "descricao", "pagina", "custo"],
    "item": ["nome", "categoria", "espaco", "descricao"],
    "imagem": ["foto_personagem", "token_personagem"]
}

# Funções uteis 

def salvar(request, campospermitidos, objeto):
    dados = json.loads(request.body)
    campo = dados.get('campo')
    valor = dados.get('valor')
    if campo not in campospermitidos:
        return {"status": False, "mensagem": "Campo Invalido."}
    if "." in campo: # Para campos relacionados" 
        relacao, campo = campo.split(".")
        if not hasattr(objeto, relacao): 
            return {"status": False, "mensagem": "Relação inválida."}
        objeto = getattr(objeto, relacao)
    setattr(objeto, campo, valor)
    objeto.save()
    return {"status": True}

def checar_permissao(request, objeto):
    if hasattr(objeto, "usuario"):
        return objeto.usuario == request.user
    if hasattr(objeto, "ficha"):
        return objeto.ficha.usuario == request.user
    if hasattr(objeto, "inventario"):
        return objeto.inventario.ficha.usuario == request.user
    return False

# Views

@login_required
def home_fichas_view(request):
    usuario = {'usuario': request.user.username}
    return render(request, 'fichas/home.html', usuario)

@login_required
def fichas_usuario_view(request):
    fichas = Ficha.objects.filter(usuario=request.user)
    vetor_fichas = [{"id": ficha.id, "nome": ficha.nome} for ficha in fichas]
    return JsonResponse(vetor_fichas, safe=False, status=200)

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
    

# CRUD Fichas

@login_required
def criar_view(request, ficha_id, categoria):
    if request.method != 'POST':
        return JsonResponse ({"status": False, "mensagem": "Método invalido"})
    modelo = Modelos.get(categoria)
    if not modelo:
        return JsonResponse ({"status": False, "mensagem": "Categoria inexistente"})
    
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if categoria == "item":
        modelo.objects.create(inventario=ficha.inventario)
        return JsonResponse({"status": True}) 
    modelo.objects.create(ficha=ficha)
    return JsonResponse({"status": True})

@login_required
def ler_view(request, ficha_id, categoria):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    pagina = Paginas.get(categoria)
    if not pagina:
        return JsonResponse ({"status": False, "mensagem": "Não encontrada"}, status=404)
    url = 'fichas/' + pagina
    return render(request, url, {'ficha': ficha})
    
@login_required
def salvar_view(request, categoria_id, categoria):
    if request.method != 'POST':
        return JsonResponse ({"status": False, "mensagem": "Método invalido"})
    mensagem = ""
    modelo = Modelos.get(categoria)
    if not modelo:
        return JsonResponse ({"status": False, "mensagem": "Categoria inexistente"})
    
    objeto = get_object_or_404(modelo, id=categoria_id)
    if not checar_permissao(request, objeto):
        return JsonResponse ({"status": False, "mensagem": "Permissão Negada"})
    
    campospermitidos = Campos_Permitidos.get(categoria, "")
    dados = salvar(request, campospermitidos, objeto)
    status = dados["status"]
    mensagem = dados.get("mensagem", "")
    return JsonResponse ({"status": status, "mensagem": mensagem})

@login_required
def excluir_view(request, categoria_id, categoria):
    if request.method != 'POST':
        return JsonResponse ({"status": False, "mensagem": "Método invalido"})
    modelo = Modelos.get(categoria)
    if not modelo:
        return JsonResponse ({"status": False, "mensagem": "Categoria inexistente"})
    objeto = get_object_or_404(modelo, id=categoria_id)
    if not checar_permissao(request, objeto):
        return JsonResponse ({"status": False, "mensagem": "Permissão Negada"})
    objeto.delete()
    return JsonResponse({"status": True})

@login_required
def salvar_imagem_view(request, ficha_id, categoria):
    if request.method != 'POST':
        return JsonResponse ({"status": False, "mensagem": "Método invalido"})
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if categoria not in Campos_Permitidos.get("imagem", []):
        return JsonResponse({"status": False, "mensagem": "Categoria inválida."})
    foto = request.FILES.get(categoria)
    if not foto:
        return JsonResponse({"status": False, "mensagem": "Nenhuma foto enviada."})
    if not foto.content_type.startswith("image/"):
        return JsonResponse({"status": False, "mensagem": "Arquivo inválido."})
    campo = getattr(ficha, categoria)
    campo.save(foto.name, foto)
    return JsonResponse({"status": True})
    



@login_required
def importar_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST' and request.FILES.get('ficha'):
        arquivo = request.FILES['ficha']
        try:
            dados = json.load(arquivo)
        except json.JSONDecodeError:
            return JsonResponse({"status": False, "mensagem": "Arquivo JSON inválido."})
        
        dados_ficha = dados.get("dados_ficha", {})
        estatisticas = dados.get("estatisticas", {})
        pericias = dados.get("pericias", [])
        habilidades = dados.get("habilidades", [])
        ataques = dados.get("ataques", [])
        inventario = dados.get("inventario", {})
        itens = dados.get("itens", [])


        return JsonResponse({"status": True})

@login_required
def exportar_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    status = get_object_or_404(Estatisticas, ficha=ficha)
    inventario = get_object_or_404(Inventario, ficha=ficha)
    pericias = Pericia.objects.filter(ficha=ficha)
    habilidades = Habilidade.objects.filter(ficha=ficha)
    ataques = Ataque.objects.filter(ficha=ficha)
    itens = Item.objects.filter(inventario=ficha.inventario)
    
    dados_ficha = {"nome": ficha.nome, "personagem": ficha.personagem, "nex": ficha.nex, "classe": ficha.classe, "trilha": ficha.trilha, "origem": ficha.origem, "patente": ficha.patente, "anotacoes": ficha.anotacoes, "aparencia": ficha.aparencia, "historia": ficha.historia}
    estatisticas = {"força": status.forca, "agilidade": status.agilidade, "vigor": status.vigor, "intelecto": status.intelecto, "presença": status.presenca, "pv_atual": status.pv_atual, "pv_maximos": status.pv_maximos, "pe_atual": status.pe_atual, "pe_maximos": status.pe_maximos, "sanidade_atual": status.sanidade_atual, "sanidade_maxima": status.sanidade_maxima, "defesa": status.defesa, "esquiva": status.esquiva, "bloqueio": status.bloqueio}
    inventario = {"carga_atual": inventario.carga_atual, "carga_maxima": inventario.carga_maxima, "cat1": inventario.cat1, "cat2": inventario.cat2, "cat3": inventario.cat3, "cat4": inventario.cat4}
    pericias = list(pericias.values("nome", "descricao", "pagina", "dados", "treinamento", "bonus"))
    habilidades = list(habilidades.values("nome", "descricao", "pagina", "custo"))
    ataques = list(ataques.values("nome", "dano", "critico"))
    itens = list(itens.values("nome", "categoria", "espaco", "descricao"))

    dados = {"dados_ficha": dados_ficha, "estatisticas": estatisticas, "pericias": pericias, "habilidades": habilidades,"ataques": ataques, "inventario": inventario, "itens": itens}

    arquivo = HttpResponse(json.dumps(dados, indent=4, cls=DjangoJSONEncoder, ensure_ascii=False), content_type='application/json')
    arquivo['Content-Disposition'] = ('attachment; filename="ficha.json"')

    return arquivo

@login_required
def limpar_ficha_view(request, ficha_id):
    ficha = get_object_or_404(Ficha, id=ficha_id, usuario=request.user)
    if request.method == 'POST':        
        Pericia.objects.filter(ficha=ficha).delete()
        Habilidade.objects.filter(ficha=ficha).delete()
        Ataque.objects.filter(ficha=ficha).delete()
        Item.objects.filter(inventario__ficha=ficha).delete()
        return JsonResponse({"status": True})
    

