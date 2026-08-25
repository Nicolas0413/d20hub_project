import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.template.loader import render_to_string
from fichas.models import Ficha
from .models import FichaSessao, Sala, JogadorExpulso
import random
import re

def rolar_dados(expressao):
    partes = re.split(r'\s*\+\s*', expressao.strip())
    
    resultados = []
    total = 0
    modificador = 0

    for parte in partes:
        parte = parte.strip()
        match = re.fullmatch(r'(\d*)d(\d+)', parte, re.IGNORECASE)

        if match:
            quantidade = int(match.group(1) or 1)
            lados = int(match.group(2))

            if quantidade > 100 or lados > 1000:
                return None

            dados = [
                random.randint(1, lados)
                for _ in range(quantidade)
            ]

            resultados.append({
                "expressao": parte,
                "dados": dados,
                "soma": sum(dados)
            })

            total += sum(dados)

        elif re.fullmatch(r'\d+', parte):
            valor = int(parte)

            if valor > 100000:
                return None

            modificador += valor
            total += valor

        else:
            return None

    return {
        "resultados": resultados,
        "modificador": modificador,
        "total": total
    }

class SalaConsumer(WebsocketConsumer):
    def connect(self):
        self.codigo_sala = self.scope['url_route']['kwargs']['codigo_sala']

        usuario = self.scope['user']

        try:
            sala = Sala.objects.get(codigo=self.codigo_sala)
        except Sala.DoesNotExist:
            self.close()
            return
        
        if JogadorExpulso.objects.filter(
            jogador=usuario,
            sala=sala
        ).exists():
            self.close()
            return

        if usuario != sala.mestre and not sala.jogadores.filter(
            id=usuario.id
        ).exists():
            self.close()
            return

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

        if mensagem.lower().startswith("/roll "):
            expressao = mensagem[6:].strip()

            resultado = rolar_dados(expressao)

            if resultado is None:
                self.send(text_data=json.dumps({
                    "type": "system",
                    "message": "Rolagem inválida."
                }))
                return

            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    "type": "dice_message",
                    "nome": self.scope["user"].username,
                    "expressao": expressao,
                    "resultado": resultado,
                }
            )

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

        elif mensagem.startswith('/expulsar_jogador'):
            parts = mensagem.split('/')
            jogador_id = parts[2] if len(parts) > 2 else None
            codigo_sala = parts[3] if len(parts) > 3 else None
            if jogador_id and codigo_sala:
                resultado = self.expulsar_jogador(
                    jogador_id,
                    codigo_sala
                )

                if resultado:
                    jogador, fichas = resultado

                    async_to_sync(self.channel_layer.group_send)(
                        self.room_group_name,
                        {
                            'type': 'jogador_expulso',
                            'jogador_id': jogador.id,
                            'fichas': fichas,
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

    def mestre_atualizado(self, event):
        self.send(text_data=json.dumps({
            'type': 'mestre_atualizado',
            'mestre_id': event['mestre_id'],
        }))

    def expulsar_jogador(self, jogador_id, codigo_sala):
        try:
            sala = Sala.objects.get(codigo=codigo_sala)
            jogador = sala.jogadores.get(id=jogador_id)
        except (Sala.DoesNotExist, Sala.jogadores.model.DoesNotExist):
            return False

        if sala.mestre != self.scope['user']:
            return False

        fichas = list(
            FichaSessao.objects.filter(
                jogador=jogador,
                sala=sala
            ).values_list('ficha_id', flat=True)
        )

        FichaSessao.objects.filter(
            jogador=jogador,
            sala=sala
        ).delete()

        sala.jogadores.remove(jogador)

        JogadorExpulso.objects.get_or_create(
            jogador=jogador,
            sala=sala
        )

        return jogador, fichas

    def jogador_expulso(self, event):
        jogador_id = event['jogador_id']
        fichas = event.get('fichas', [])

        if self.scope['user'].id == jogador_id:
            self.send(text_data=json.dumps({
                'type': 'voce_foi_expulso',
                'mensagem': 'Você foi expulso desta sala.'
            }))

            self.close()
            return

        self.send(text_data=json.dumps({
            'type': 'jogador_expulso',
            'jogador_id': jogador_id,
            'fichas': fichas,
        }))

    def dice_message(self, event):
        self.send(text_data=json.dumps({
            "type": "dice_message",
            "nome": event["nome"],
            "expressao": event["expressao"],
            "resultado": event["resultado"],
        }))