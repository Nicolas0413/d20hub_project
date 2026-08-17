import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.template.loader import render_to_string
from fichas.models import Ficha
from .models import FichaSessao, Sala

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

    def remover_ficha_da_sala(self, ficha_id, codigo_sala):
        try:
            ficha = Ficha.objects.get(id=ficha_id)
            sala = Sala.objects.get(codigo=codigo_sala)
        except (Ficha.DoesNotExist, Sala.DoesNotExist):
            return False

        FichaSessao.objects.filter(ficha=ficha, jogador=self.scope['user'], sala=sala).delete()
        return True

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        mensagem = (text_data_json.get('mensagem') or '').strip()

        if not mensagem:
            return

        if mensagem.startswith('/carregar_ficha'):
            ficha_id = mensagem.split('/')[2] if len(mensagem.split('/')) > 2 else None
            codigo_sala = mensagem.split('/')[3] if len(mensagem.split('/')) > 3 else None
            if ficha_id:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'carregar_ficha',
                        'mensagem': f'Carregando ficha {ficha_id}...',
                        'ficha': ficha_id,
                        'codigo_sala': codigo_sala
                    }
                )
        elif mensagem.startswith('/remover_ficha'):
            ficha_id = mensagem.split('/')[2] if len(mensagem.split('/')) > 2 else None
            codigo_sala = mensagem.split('/')[3] if len(mensagem.split('/')) > 3 else None
            if ficha_id and codigo_sala:
                if self.remover_ficha_da_sala(ficha_id, codigo_sala):
                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name,
                        {
                            'type': 'remover_ficha',
                            'mensagem': f'Removendo ficha {ficha_id}...',
                            'ficha': ficha_id,
                            'codigo_sala': codigo_sala
                        }
                    )
                else:
                    self.send(text_data=json.dumps({
                        'type': 'system',
                        'message': 'Ficha ou sala inválida.'
                    }))
            else:
                self.send(text_data=json.dumps({
                    'type': 'system',
                    'message': 'Uso correto: /remover_ficha <id_da_ficha>'
                }))
        elif mensagem.startswith('/atualizar_visibilidade'):
            parts = mensagem.split('/')
            ficha_id = parts[2] if len(parts) > 2 else None
            visibilidade = parts[3] if len(parts) > 3 else None
            codigo_sala = parts[4] if len(parts) > 4 else None
            if ficha_id and visibilidade and codigo_sala:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'atualizar_visibilidade',
                        'ficha_id': ficha_id,
                        'visibilidade': visibilidade,
                        'codigo_sala': codigo_sala
                    }
                )
        elif mensagem.startswith('/atualizar_editabilidade'):
            parts = mensagem.split('/')
            ficha_id = parts[2] if len(parts) > 2 else None
            editabilidade = parts[3] if len(parts) > 3 else None
            codigo_sala = parts[4] if len(parts) > 4 else None
            if ficha_id and editabilidade and codigo_sala:
                async_to_sync(self.channel_layer.group_send)(
                    self.room_group_name,
                    {
                        'type': 'atualizar_editabilidade',
                        'ficha_id': ficha_id,
                        'editabilidade': editabilidade,
                        'codigo_sala': codigo_sala
                    }
                )
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
            'ficha_id': event.get('ficha'),
            'codigo_sala': event.get('codigo_sala')
        }))

    def remover_ficha(self, event):
        self.send(text_data=json.dumps({
            'type': 'remover_ficha',
            'ficha_id': event.get('ficha'),
            'codigo_sala': event.get('codigo_sala')
        }))

    def atualizar_visibilidade(self, event):
        self.send(text_data=json.dumps({
            'type': 'atualizar_visibilidade',
            'ficha_id': event.get('ficha_id'),
            'visibilidade': event.get('visibilidade'),
            'codigo_sala': event.get('codigo_sala')
        }))

    def atualizar_editabilidade(self, event):
        self.send(text_data=json.dumps({
            'type': 'atualizar_editabilidade',
            'ficha_id': event.get('ficha_id'),
            'editabilidade': event.get('editabilidade'),
            'codigo_sala': event.get('codigo_sala')
        }))