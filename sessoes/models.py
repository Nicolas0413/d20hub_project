import secrets
from django.db import models
from django.conf import settings                                                            

from fichas.models import Ficha 

def gerar_codigo_unico():
    return secrets.token_hex(3).upper()

class Sala(models.Model):
    codigo = models.CharField(max_length=6, unique=True, default=gerar_codigo_unico)
    mestre = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="salas_mestrando")

    def __str__(self):
        return f"({self.codigo})"

class FichaSessao(models.Model):
    sala = models.ForeignKey(Sala, on_delete=models.CASCADE, related_name="fichas_linkadas")
    ficha = models.ForeignKey(Ficha, on_delete=models.CASCADE)
    jogador = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('sala', 'jogador')