from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/sala/(?P<codigo_sala>\w+)/$', consumers.SalaConsumer.as_asgi()),
]