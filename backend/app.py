"""
app.py — API REST com Flask
Starlink Dashboard — Refatoração Acadêmica (POO)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Usuario, CentralSuporte, RecomendadorPlanos

app = Flask(__name__)

# Libera TODAS as origens em desenvolvimento
CORS(app)

recomendador = RecomendadorPlanos()


def resposta(dados: dict, status: int = 200):
    return jsonify(dados), status


# ── AUTENTICAÇÃO ──────────────────────────────────────────────────────────────

@app.route("/api/cadastro", methods=["POST"])
def cadastro():
    dados = request.get_json(silent=True)
    if not dados:
        return resposta({"erro": "Body JSON inválido ou ausente."}, 400)

    for campo in ["nome", "username", "email", "senha"]:
        if not dados.get(campo):
            return resposta({"erro": f"Campo obrigatório ausente: '{campo}'."}, 400)

    novo_usuario = Usuario(
        nome=dados["nome"],
        username=dados["username"],
        email=dados["email"],
        senha=dados["senha"],
    )

    resultado = novo_usuario.cadastrar()
    if not resultado["sucesso"]:
        return resposta({"erro": resultado["mensagem"]}, 400)

    return resposta({"mensagem": resultado["mensagem"]}, 201)


@app.route("/api/login", methods=["POST"])
def login():
    dados = request.get_json(silent=True)
    if not dados:
        return resposta({"erro": "Body JSON inválido ou ausente."}, 400)

    usuario = Usuario.autenticar(
        dados.get("username", ""),
        dados.get("senha", "")
    )

    if not usuario:
        return resposta({"erro": "Credenciais inválidas."}, 401)

    return resposta({
        "mensagem": "Login realizado com sucesso.",
        "perfil": usuario.exibir_perfil(),
        "token": f"fake-jwt-{usuario.id}",
    }, 200)


@app.route("/api/perfil/<username>", methods=["GET"])
def perfil(username: str):
    usuario = Usuario._repositorio.get(username)
    if not usuario:
        return resposta({"erro": "Usuário não encontrado."}, 404)
    return resposta(usuario.exibir_perfil(), 200)


# ── SUPORTE ───────────────────────────────────────────────────────────────────

@app.route("/api/suporte/tipos", methods=["GET"])
def suporte_tipos():
    return resposta({"tipos": CentralSuporte.tipos_disponiveis()}, 200)


@app.route("/api/suporte/solucao", methods=["POST"])
def suporte_solucao():
    dados = request.get_json(silent=True)
    if not dados or not dados.get("tipo"):
        return resposta({"erro": "Campo 'tipo' é obrigatório."}, 400)

    resultado = CentralSuporte.obter_solucao(dados["tipo"])
    if resultado.get("erro"):
        return resposta({"erro": resultado["mensagem"]}, 400)

    return resposta(resultado, 200)


@app.route("/api/suporte/solucao/<tipo>", methods=["GET"])
def suporte_solucao_get(tipo: str):
    resultado = CentralSuporte.obter_solucao(tipo)
    if resultado.get("erro"):
        return resposta({"erro": resultado["mensagem"]}, 400)
    return resposta(resultado, 200)


# ── PLANOS ────────────────────────────────────────────────────────────────────

@app.route("/api/planos/opcoes", methods=["GET"])
def planos_opcoes():
    return resposta({
        "continentes": recomendador.listar_continentes(),
        "finalidades": recomendador.listar_finalidades(),
    }, 200)


@app.route("/api/planos/recomendar", methods=["POST"])
def planos_recomendar():
    dados = request.get_json(silent=True)
    if not dados:
        return resposta({"erro": "Body JSON inválido ou ausente."}, 400)

    continente = dados.get("continente", "").strip()
    finalidade = dados.get("finalidade", "").strip()

    if not continente or not finalidade:
        return resposta({"erro": "Campos 'continente' e 'finalidade' são obrigatórios."}, 400)

    planos = recomendador.recomendar(continente, finalidade)
    return resposta({
        "continente": continente,
        "finalidade": finalidade,
        "total": len(planos),
        "planos": planos,
    }, 200)


# ── HEALTH-CHECK ──────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return resposta({"status": "ok", "versao": "1.0.0"}, 200)


# ── PONTO DE ENTRADA ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)