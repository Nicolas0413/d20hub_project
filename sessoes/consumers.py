import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.template.loader import render_to_string
from fichas.models import Ficha

class SalaConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.codigo_sala = self.scope['url_route']['kwargs']['codigo_sala']
            self.room_group_name = f"sala_{self.codigo_sala}"

            self.accept()

            async_to_sync(self.channel_layer.group_add)(
                self.room_group_name,
                self.channel_name,
            )

            self.send(text_data=json.dumps({
                'type': 'system',
                'message': f'Conectado à sala {self.codigo_sala}.'
            }))
        except Exception as e:
            self.send(text_data=json.dumps({
                'type': 'system',
                'message': f'Erro na conexão: {e}'
            }))
            self.close()

    def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            async_to_sync(self.channel_layer.group_discard)(
                self.room_group_name,
                self.channel_name,
            )

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        mensagem = (text_data_json.get('mensagem') or '').strip()

        if not mensagem:
            return

        if mensagem.startswith('/carregar_ficha'):
            ficha_id = mensagem.split(' ')[1] if len(mensagem.split(' ')) > 1 else None
            if ficha_id:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'carregar_ficha',
                        'mensagem': f'Carregando ficha {ficha_id}...',
                        'ficha': ficha_id,
                    }
                )
            else:
                self.send(text_data=json.dumps({
                    'type': 'system',
                    'message': 'Uso correto: /carregar_ficha <id_da_ficha>'
                }))
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'nome': self.scope['user'].username,
                    'mensagem': mensagem,
                }
            )

    def chat_message(self, event):
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'nome': event['nome'],
            'mensagem': event['mensagem'],
        }))

    def carregar_ficha(self, event):
        self.send(text_data=json.dumps({
            'type': 'carregar_ficha',
            'ficha_id': event.get('ficha')
        }))