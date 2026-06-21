import json
from channels.generic.websocket import WebsocketConsumer

class SalaConsumer(WebsocketConsumer):
    def connect(self):
        try:
            self.codigo_sala = self.scope['url_route']['kwargs']['codigo_sala']
            print(f"--- Código da sala capturado: {self.codigo_sala} ---")
            self.accept()
            self.send(text_data=json.dumps({
                'message': 'Conexão estabelecida com sucesso!'
            }))
        except Exception as e:
            print(f"--- ERRO NA CONEXÃO: {e} ---")
            self.close()

    def disconnect(self, close_code):
        print("--- CONEXÃO ENCERRADA ---")

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        mensagem = text_data_json.get('mensagem')

        print(f"--- Mensagem recebida: {mensagem} ---")
        self.send(text_data=json.dumps({
            'type': 'chat_message',
            'mensagem': mensagem
        }))