from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    apelido = models.CharField(max_length=64, blank=True, null=True)
    foto_perfil = models.ImageField(upload_to='fotos_perfil/', blank=True, null=True)
    email = models.EmailField(unique=True)
