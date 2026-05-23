from django.db import models
from django.conf import settings

class Ficha(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fichas")
    nome = models.CharField(max_length=64, default="")
    personagem = models.CharField(max_length=64, default="Nome do personagem")
    foto_personagem = models.ImageField(upload_to='fotos_fichas/', default="fotos_fichas/Aguiar.jpg")
    nex = models.IntegerField(null=True, blank=True, default=40)
    classe = models.CharField(max_length=32, default="Combatente")
    trilha = models.CharField(max_length=32, default="Aniquilador")
    origem = models.CharField(max_length=32, default="Acadêmico")
    pericias = models.ManyToManyField('Pericia', through='TreinamentoFichaPericia', blank=True)
    inventario = models.ManyToManyField('Item', blank=True)
    anotacoes = models.TextField(default="Anotoções gerais sobre o personagem e missões")
    aparencia = models.TextField(default="Descrição física do personagem como: genêro, idade, altura etc.")
    historia = models.TextField(default="História do personagem (de onde veio, qual seu objetivo etc.)")
    token_personagem = models.ImageField(upload_to='token_personagens/', default="token_personagens/Aguiar_corpo.png")

    def __str__(self):
        return self.nome

class Estatisticas(models.Model):
    ficha = models.OneToOneField(Ficha, on_delete=models.CASCADE, related_name="estatisticas")
    forca = models.IntegerField(default=1)
    agilidade = models.IntegerField(default=1)
    vigor = models.IntegerField(default=1)
    intelecto = models.IntegerField(default=1)
    presenca = models.IntegerField(default=1)
    pv_atual = models.IntegerField(null=True, blank=True)
    pv_maximos = models.IntegerField(null=True, blank=True)
    pe_atual = models.IntegerField(null=True, blank=True)
    pe_maximos = models.IntegerField(null=True, blank=True)
    sanidade_atual = models.IntegerField(null=True, blank=True)
    sanidade_maxima = models.IntegerField(null=True, blank=True)
    defesa = models.IntegerField(null=True, blank=True)
    esquiva = models.IntegerField(null=True, blank=True)
    bloqueio = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"Estatísticas de {self.ficha.nome}"

class Pericia(models.Model):
    nome = models.CharField(max_length=128, default="")
    descricao = models.TextField(default="")
    pagina = models.CharField(max_length=128, default="")

    def __str__(self):
        return self.nome

class TreinamentoFichaPericia(models.Model):
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, related_name="treinamentos_pericias")
    pericia = models.ForeignKey(Pericia, on_delete=models.CASCADE, related_name="treinamentos_pericias")
    dados = models.IntegerField(null=True, blank=True, default=1)
    treinamento = models.CharField(max_length=32, default="")
    bonus = models.IntegerField(null=True, blank=True, default=0)

class Ataque(models.Model):
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, related_name="ataques")
    nome = models.CharField(max_length=32, default="")
    dano = models.CharField(max_length=16, null=True, blank=True)
    critico = models.CharField(max_length=16, null=True, blank=True)

    def __str__(self):
        return self.nome

class Habilidade(models.Model):
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE, related_name="habilidades")
    nome = models.CharField(max_length=128, default="")
    descricao = models.TextField(default="")
    pagina = models.CharField(max_length=128, default="")
    custo = models.CharField(max_length=128, default="")

    def __str__(self):
        return self.nome

class Item(models.Model):
    nome = models.CharField(max_length=128, default="")
    espaco = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    descricao = models.TextField(default="")
    pagina = models.CharField(max_length=128, default="")

    def __str__(self):
        return self.nome

    
    