from Classes.usuario import Usuario
import sqlite3
import os
from werkzeug.security import check_password_hash

class Funcoes:
    def __init__(self):
        # Define o caminho do banco de dados na pasta do projeto
        self.db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dados.db")

    def criarConta(self, login, senha):
        user = Usuario(login, senha)
        connect = sqlite3.connect(self.db_path)
        cursor = connect.cursor()
        cursor.execute("SELECT login FROM usuarios")
        usuarios = cursor.fetchall() 
        for i in usuarios:
            if i[0] == login:
                connect.close()
                return False
        cursor.execute('''
        INSERT INTO usuarios (login, senha)
        VALUES (?, ?)
        ''', (login, senha))
        connect.commit()
        connect.close()
        return True

    def iniciarTabela(self):
        connect = sqlite3.connect(self.db_path)
        cursor = connect.cursor()
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        login TEXT,
        senha TEXT
        )
        ''')
        connect.commit()
        connect.close()
    
    def listarUsuarios(self):
        connect = sqlite3.connect(self.db_path)
        cursor = connect.cursor()
        cursor.execute("SELECT id, login FROM usuarios")
        usuarios = cursor.fetchall()  
        connect.close()

        # Retorna lista de dicionários para renderização mais clara no template
        if usuarios:
            return [{'id': usuario[0], 'login': usuario[1]} for usuario in usuarios]
        return []
        
    def autentificarlogin(self, login, senha):
        connect = sqlite3.connect(self.db_path)
        cursor = connect.cursor()
        cursor.execute("SELECT senha FROM usuarios WHERE login = ?", (login,))
        usuario = cursor.fetchone() 
        if usuario and senha == usuario[0]: #Checa se usuario existe e se a senha ta certa.
        #if usuario and check_password_hash(usuario[0], senha):   Msm coisa, soq pra senha criptografada, descomentar qnd td funcionar.
            connect.commit()
            connect.close()
            return True
        connect.commit()
        connect.close()