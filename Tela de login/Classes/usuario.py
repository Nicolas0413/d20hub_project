class Usuario:
    id_contador = 0
    def __init__(self, login, senha):
        self.login = login
        self.senha = senha
        self.nome = login
        self.id = Usuario.id_contador
        Usuario.id_contador += 1

    def __repr__(self):
        return f"O usuário {self.nome} tem o id {self.id}, login {self.login} e a senha {self.senha}"
    
    def mudarnome(self, novonome):
        self.nome = novonome

    def mudarsenha(self, novasenha):
        self.senha = novasenha