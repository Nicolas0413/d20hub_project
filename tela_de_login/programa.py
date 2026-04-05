from flask import Flask, request, session, redirect, url_for, render_template, send_from_directory
import sqlite3
import os
from functools import wraps
from Classes.funcoes import Funcoes
from Classes.usuario import Usuario
from werkzeug.security import generate_password_hash

app = Flask(__name__)
funcoes = Funcoes()
app.secret_key = "slamanitoteviraai" #Chave de segurança pro session conseguir salvar do jeito certo

# Inicializar tabela uma única vez na inicialização
with app.app_context():
    funcoes.iniciarTabela()

# Decorador para proteger rotas que requerem autenticação
def requer_login(f):
    @wraps(f)
    def funcao_protegida(*args, **kwargs):
        if "usuario" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return funcao_protegida

@app.route("/", methods=["GET"])
def inicio():
    """Redireciona para a página de login"""
    if "usuario" in session:
        return redirect(url_for("menu"))
    return redirect(url_for("login"))

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form.get("login", "").strip()  # .strip() remove espaços
        senha = request.form.get("senha", "").strip()
        
        if not username or not senha:
            return render_template("signup.html", erro="Login e senha são obrigatórios!")
        
        if len(username) < 3:
            return render_template("signup.html", erro="Login deve ter pelo menos 3 caracteres!")
        
        if len(senha) < 4:
            return render_template("signup.html", erro="Senha deve ter pelo menos 4 caracteres!")
        
        if funcoes.criarConta(username, senha):
            return render_template("signup.html", sucesso="Usuário cadastrado com sucesso! Faça login.")
        else:
            return render_template("signup.html", erro="Este login já existe!")
    return render_template("signup.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("login", "").strip()
        senha = request.form.get("senha", "").strip()
        
        if not username or not senha:
            return render_template("login.html", erro="Login e senha são obrigatórios!")
        
        if funcoes.autentificarlogin(username, senha):
            session["usuario"] = username  # Reconhece que o usuario ta logado
            return redirect(url_for("menu"))
        else:
            return render_template("login.html", erro="Login ou senha incorretos!")
    return render_template("login.html")

@app.route("/listar", methods=["GET"])
@requer_login
def listar():
    usuarios = funcoes.listarUsuarios() or []
    if not usuarios:
        return render_template("listar.html", usuarios=[], mensagem="Nenhum usuário cadastrado.")
    return render_template("listar.html", usuarios=usuarios)

@app.route("/menu", methods=["GET", "POST"])
@requer_login
def menu():
    """Menu principal - só acessível para usuários logados"""
    return render_template("menu.html", usuario=session.get("usuario"))

@app.route("/logout", methods=["GET"])
def logout():
    """Faz logout do usuário"""
    session.pop("usuario", None)  # Remove o usuário da sessão
    return redirect(url_for("login"))

@app.route("/d20/", methods=["GET"])
@requer_login
def d20_root():
    """Mostra a página principal do d20hub_project"""
    d20_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    return send_from_directory(d20_dir, "index.html")

@app.route("/d20/<path:filename>", methods=["GET"])
@requer_login
def d20_static(filename):
    """Servir CSS, JS, imagens e outros arquivos do d20hub_project"""
    d20_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    return send_from_directory(d20_dir, filename)

if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)


    
