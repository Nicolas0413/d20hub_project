from django.db import models
from django.conf import settings

class Ficha(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="fichas")
    nome = models.CharField(max_length=128, default="")
    personagem = models.CharField(max_length=128, null=True, blank=True)
    foto_personagem = models.ImageField(upload_to='fotos_personagem/', blank=True, null=True)
    nex = models.IntegerField(null=True, blank=True)
    classe = models.CharField(max_length=128, null=True, blank=True)
    trilha = models.CharField(max_length=128, null=True, blank=True)
    origem = models.CharField(max_length=128, null=True, blank=True)
    atributos = models.JSONField(null=True, blank=True)
    estatisticas = models.JSONField(null=True, blank=True)
    ataques = models.JSONField(null=True, blank=True)
    habilidades = models.JSONField(null=True, blank=True)
    pericias = models.JSONField(null=True, blank=True)
    inventario = models.JSONField(null=True, blank=True)
    detalhes = models.TextField(null=True, blank=True)
    token_personagem = models.ImageField(upload_to='tokens_personagem/', blank=True, null=True)
