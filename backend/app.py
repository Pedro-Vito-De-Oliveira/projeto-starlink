"""
app.py — API REST com Flask
Starlink Dashboard — Refatoração Acadêmica (POO)

Responsabilidade deste arquivo:
  - Receber requisições HTTP do Next.js (JSON)
  - Delegar a lógica de negócio para as classes em models.py
  - Retornar respostas em JSON padronizadas

Conceito POO aplicado aqui:
  - Os endpoints são "controladores leves": não contêm lógica,
    apenas fazem a ponte entre HTTP e as classes de modelo.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

# Importa todas as classes do módulo de modelos
from models import Usuario, CentralSuporte, RecomendadorPlanos

# ─────────────────────────────────────────────
# Configuração da aplicação Flask
# ─────────────────────────────────────────────

app = Flask(__name__)

# CORS: permite que o frontend Next.js (localhost:3000) acesse a API.
# Em produção, troque origins pelo domínio real do seu frontend.
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# Instância única do RecomendadorPlanos (padrão Singleton implícito):
# não há necessidade de recriar o catálogo a cada requisição.
recomendador = RecomendadorPlanos()


# ─────────────────────────────────────────────
# Utilitário: resposta padronizada
# ─────────────────────────────────────────────

def resposta(dados: dict, status: int = 200):
    """Helper para garantir Content-Type JSON em todas as respostas."""
    return jsonify(dados), status


# ─────────────────────────────────────────────
# A) ROTAS DE AUTENTICAÇÃO
# ─────────────────────────────────────────────

@app.route("/api/cadastro", methods=["POST"])
def cadastro():
    """
    Cadastra um novo usuário.

    Body JSON esperado:
        { "nome": str, "username": str, "email": str, "senha": str }

    Respostas:
        201 — usuário criado com sucesso
        400 — dados ausentes ou username já existente
    """
    dados = request.get_json(silent=True)
    if not dados:
        return resposta({"erro": "Body JSON inválido ou ausente."}, 400)

    campos_obrigatorios = ["nome", "username", "email", "senha"]
    for campo in campos_obrigatorios:
        if not dados.get(campo):
            return resposta({"erro": f"Campo obrigatório ausente: '{campo}'."}, 400)

    # Instancia a classe Usuario (encapsulamento: hash da senha feito internamente)
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
    """
    Autentica um usuário.

    Body JSON esperado:
        { "username": str, "senha": str }

    Respostas:
        200 — autenticado; retorna perfil público
        401 — credenciais inválidas
    """
    dados = request.get_json(silent=True)
    if not dados:
        return resposta({"erro": "Body JSON inválido ou ausente."}, 400)

    username = dados.get("username", "")
    senha = dados.get("senha", "")

    # Delega a verificação para o método estático da classe Usuario
    usuario = Usuario.autenticar(username, senha)

    if not usuario:
        return resposta({"erro": "Credenciais inválidas."}, 401)

    # Retorna apenas o perfil público (sem senha)
    return resposta({
        "mensagem": "Login realizado com sucesso.",
        "perfil": usuario.exibir_perfil(),
        # Em um sistema real, aqui viria um JWT token
        "token": f"fake-jwt-{usuario.id}",
    }, 200)


@app.route("/api/perfil/<username>", methods=["GET"])
def perfil(username: str):
    """
    Retorna o perfil público de um usuário pelo username.

    Respostas:
        200 — perfil encontrado
        404 — usuário não encontrado
    """
    usuario = Usuario._repositorio.get(username)
    if not usuario:
        return resposta({"erro": "Usuário não encontrado."}, 404)

    return resposta(usuario.exibir_perfil(), 200)


# ─────────────────────────────────────────────
# B) ROTAS DE SUPORTE
# ─────────────────────────────────────────────

@app.route("/api/suporte/tipos", methods=["GET"])
def suporte_tipos():
    """
    Lista os tipos de problemas disponíveis.

    Resposta 200:
        { "tipos": ["rede", "tecnico", "velocidade"] }
    """
    return resposta({"tipos": CentralSuporte.tipos_disponiveis()}, 200)


@app.route("/api/suporte/solucao", methods=["POST"])
def suporte_solucao():
    """
    Retorna a solução para um tipo de problema informado.

    Body JSON esperado:
        { "tipo": "rede" | "tecnico" | "velocidade" }

    Respostas:
        200 — solução encontrada
        400 — tipo ausente ou inválido
    """
    dados = request.get_json(silent=True)
    if not dados or not dados.get("tipo"):
        return resposta({"erro": "Campo 'tipo' é obrigatório."}, 400)

    # Delega para a CentralSuporte — polimorfismo acontece aqui
    resultado = CentralSuporte.obter_solucao(dados["tipo"])

    if resultado.get("erro"):
        return resposta({"erro": resultado["mensagem"]}, 400)

    return resposta(resultado, 200)


# Rota alternativa GET (conveniente para testes via navegador/curl)
@app.route("/api/suporte/solucao/<tipo>", methods=["GET"])
def suporte_solucao_get(tipo: str):
    """
    Versão GET da rota de solução — recebe o tipo pela URL.
    Ex: GET /api/suporte/solucao/rede
    """
    resultado = CentralSuporte.obter_solucao(tipo)
    if resultado.get("erro"):
        return resposta({"erro": resultado["mensagem"]}, 400)
    return resposta(resultado, 200)


# ─────────────────────────────────────────────
# C) ROTAS DE PLANOS
# ─────────────────────────────────────────────

@app.route("/api/planos/opcoes", methods=["GET"])
def planos_opcoes():
    """
    Retorna os continentes e finalidades disponíveis para o formulário
    de recomendação no frontend.

    Resposta 200:
        {
          "continentes": [...],
          "finalidades": [...]
        }
    """
    return resposta({
        "continentes": recomendador.listar_continentes(),
        "finalidades": recomendador.listar_finalidades(),
    }, 200)


@app.route("/api/planos/recomendar", methods=["POST"])
def planos_recomendar():
    """
    Recomenda planos com base no continente e finalidade do usuário.

    Body JSON esperado:
        { "continente": str, "finalidade": str }

    Respostas:
        200 — lista de planos (pode ser vazia se nenhum der match)
        400 — campos obrigatórios ausentes
    """
    dados = request.get_json(silent=True)
    if not dados:
        return resposta({"erro": "Body JSON inválido ou ausente."}, 400)

    continente = dados.get("continente", "").strip()
    finalidade = dados.get("finalidade", "").strip()

    if not continente or not finalidade:
        return resposta(
            {"erro": "Campos 'continente' e 'finalidade' são obrigatórios."}, 400
        )

    # Delega a filtragem para RecomendadorPlanos (Separação de Responsabilidades)
    planos = recomendador.recomendar(continente, finalidade)

    return resposta({
        "continente": continente,
        "finalidade": finalidade,
        "total": len(planos),
        "planos": planos,
    }, 200)


# ─────────────────────────────────────────────
# Health-check (útil para o frontend verificar se a API está no ar)
# ─────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return resposta({"status": "ok", "versao": "1.0.0"}, 200)


# ─────────────────────────────────────────────
# Ponto de entrada
# ─────────────────────────────────────────────

if __name__ == "__main__":
    # debug=True reinicia automaticamente ao salvar — use apenas em dev
    app.run(debug=True, port=5000)
