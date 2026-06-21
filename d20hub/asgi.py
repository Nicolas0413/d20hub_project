import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import sessoes.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'd20hub.settings')

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            sessoes.routing.websocket_urlpatterns
        )
    ),
})

print("ASGI CONFIGURADO")