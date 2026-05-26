"""
models.py — Camada de Modelos (POO pura)
Starlink Dashboard — Refatoração Acadêmica (POO)

Conceitos aplicados:
  - Encapsulamento   : atributos privados com getters/setters e @property
  - Herança          : classe base Problema → subclasses especializadas
  - Polimorfismo     : método get_solucao() redefinido em cada subclasse
  - Abstração        : ABC para forçar contrato nas subclasses de Problema
  - Separação de Responsabilidades: cada classe tem um único domínio
"""

from __future__ import annotations

import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
from werkzeug.security import generate_password_hash, check_password_hash


# ─────────────────────────────────────────────
# A) AUTENTICAÇÃO — Classe Usuario
# ─────────────────────────────────────────────

class Usuario:
    """
    Representa um usuário do sistema.

    Encapsulamento:
        _senha nunca é exposta diretamente; apenas o hash é armazenado.
    """

    # "Banco de dados" em memória: dict[username → Usuario]
    _repositorio: dict[str, "Usuario"] = {}

    def __init__(self, nome: str, username: str, email: str, senha: str) -> None:
        self._id: str = str(uuid.uuid4())
        self._nome: str = nome
        self._username: str = username
        self._email: str = email
        # Encapsulamento: a senha nunca é salva em texto puro
        self._senha_hash: str = generate_password_hash(senha)

    # ── Getters via @property (encapsulamento) ──────────────────────────────

    @property
    def id(self) -> str:
        return self._id

    @property
    def nome(self) -> str:
        return self._nome

    @property
    def username(self) -> str:
        return self._username

    @property
    def email(self) -> str:
        return self._email

    # ── Métodos de negócio ──────────────────────────────────────────────────

    def cadastrar(self) -> dict:
        """
        Persiste o usuário no repositório em memória.
        Retorna erro se username já existe.
        """
        if self._username in Usuario._repositorio:
            return {"sucesso": False, "mensagem": "Username já cadastrado."}
        Usuario._repositorio[self._username] = self
        return {"sucesso": True, "mensagem": "Usuário cadastrado com sucesso."}

    @staticmethod
    def autenticar(username: str, senha: str) -> Optional["Usuario"]:
        """
        Verifica credenciais. Retorna o objeto Usuario ou None.
        Método estático: não precisa de instância para ser chamado.
        """
        usuario = Usuario._repositorio.get(username)
        if usuario and check_password_hash(usuario._senha_hash, senha):
            return usuario
        return None

    def exibir_perfil(self) -> dict:
        """
        Retorna apenas os dados públicos do perfil (sem senha).
        Comunicação API: este dict vira o JSON da resposta.
        """
        return {
            "username": self._username,
            "email": self._email,
            "nome": self._nome,
        }

    def __repr__(self) -> str:
        return f"<Usuario username={self._username}>"


# ─────────────────────────────────────────────
# B) SUPORTE — Herança + Polimorfismo
# ─────────────────────────────────────────────

class Problema(ABC):
    """
    Classe base abstrata para problemas de suporte.

    Abstração: define o contrato (get_solucao) que toda subclasse DEVE implementar.
    Polimorfismo: cada subclasse redefine get_solucao() com conteúdo específico.
    """

    def __init__(self, titulo: str) -> None:
        self._titulo = titulo

    @property
    def titulo(self) -> str:
        return self._titulo

    @abstractmethod
    def get_solucao(self) -> dict:
        """Retorna o passo a passo de solução para o problema."""
        ...

    def to_dict(self) -> dict:
        """Serializa o problema para JSON."""
        return {
            "tipo": self.__class__.__name__,
            "titulo": self._titulo,
            **self.get_solucao(),
        }


class ProblemaRede(Problema):
    """Problemas relacionados à conectividade de rede."""

    def __init__(self) -> None:
        super().__init__("Problema de Rede")

    def get_solucao(self) -> dict:
        return {
            "descricao": "Falha na conexão de rede detectada.",
            "passos": [
                "Verifique se o cabo de alimentação do terminal Starlink está conectado.",
                "Reinicie o roteador aguardando 60 segundos antes de religar.",
                "Certifique-se de que o prato Starlink tem visão desobstruída do céu.",
                "Acesse o app Starlink e execute o diagnóstico de obstrução.",
                "Se o problema persistir, verifique o status de outage na sua região pelo app.",
            ],
            "tempo_estimado": "5–15 minutos",
        }


class ProblemaTecnico(Problema):
    """Problemas de hardware ou firmware do terminal Starlink."""

    def __init__(self) -> None:
        super().__init__("Problema Técnico")

    def get_solucao(self) -> dict:
        return {
            "descricao": "Falha técnica no hardware ou firmware identificada.",
            "passos": [
                "Verifique se o LED do terminal está na cor esperada (branco fixo = OK).",
                "Reinicie o terminal pelo app: Menu → Configurações → Reiniciar.",
                "Inspecione fisicamente o cabo do terminal para identificar danos visíveis.",
                "Atualize o firmware pelo app Starlink (Configurações → Avançado).",
                "Se o LED piscar em vermelho, entre em contato com o suporte oficial.",
            ],
            "tempo_estimado": "10–30 minutos",
        }


class ProblemaVelocidade(Problema):
    """Problemas de baixa velocidade ou instabilidade de banda larga."""

    def __init__(self) -> None:
        super().__init__("Velocidade da Banda Larga")

    def get_solucao(self) -> dict:
        return {
            "descricao": "Velocidade abaixo do esperado detectada.",
            "passos": [
                "Execute um teste de velocidade no app Starlink para coletar métricas.",
                "Reduza o número de dispositivos conectados simultaneamente.",
                "Posicione o roteador em local central e elevado, longe de obstáculos metálicos.",
                "Verifique se há janelas de manutenção programadas na sua região.",
                "Considere upgrade para o plano Starlink Priority se o uso for intenso.",
            ],
            "tempo_estimado": "5–20 minutos",
        }


class CentralSuporte:
    """
    Fábrica e centralizador de problemas.

    Separação de Responsabilidades: esta classe conhece os tipos disponíveis
    e delega a lógica específica para cada subclasse de Problema.
    """

    _MAPA: dict[str, type[Problema]] = {
        "rede": ProblemaRede,
        "tecnico": ProblemaTecnico,
        "velocidade": ProblemaVelocidade,
    }

    @classmethod
    def obter_solucao(cls, tipo: str) -> dict:
        """
        Polimorfismo em ação: instancia a subclasse correta e chama get_solucao().
        Retorna erro padronizado se o tipo não for reconhecido.
        """
        chave = tipo.lower().strip()
        classe = cls._MAPA.get(chave)
        if not classe:
            return {
                "erro": True,
                "mensagem": f"Tipo '{tipo}' inválido. Use: {list(cls._MAPA.keys())}",
            }
        problema: Problema = classe()
        return {"erro": False, **problema.to_dict()}

    @classmethod
    def tipos_disponiveis(cls) -> list[str]:
        return list(cls._MAPA.keys())


# ─────────────────────────────────────────────
# C) RECOMENDADOR DE PLANOS
# ─────────────────────────────────────────────

@dataclass
class Plano:
    """
    Representa um plano de serviço Starlink.

    @dataclass gera __init__, __repr__ e __eq__ automaticamente,
    reduzindo boilerplate e aplicando o princípio DRY.
    """
    nome: str
    preco: float          # USD/mês
    continente: str       # "América do Sul", "América do Norte", etc.
    finalidade: str       # "Residencial", "Empresarial", "Marítimo", "Móvel"
    velocidade_mbps: int  # velocidade máxima de download estimada
    descricao: str = field(default="")

    def to_dict(self) -> dict:
        return {
            "nome": self.nome,
            "preco": self.preco,
            "continente": self.continente,
            "finalidade": self.finalidade,
            "velocidade_mbps": self.velocidade_mbps,
            "descricao": self.descricao,
        }


class RecomendadorPlanos:
    """
    Responsável pela regra de negócio de recomendação de planos.

    Separação de Responsabilidades:
        - Plano: conhece seus próprios dados
        - RecomendadorPlanos: conhece a lógica de filtragem

    O método recomendar() varre a lista de objetos Plano e retorna apenas
    os que correspondem aos critérios do usuário.
    """

    def __init__(self) -> None:
        # Catálogo pré-cadastrado de planos (simulação de banco de dados)
        self._planos: list[Plano] = self._seed_planos()

    def _seed_planos(self) -> list[Plano]:
        """Inicializa o catálogo com dados realistas da Starlink."""
        return [
            # ── América do Sul ──────────────────────────────────────────
            Plano(
                nome="Starlink Residencial",
                preco=120.0,
                continente="Região Sul",
                finalidade="Residencial",
                velocidade_mbps=200,
                descricao="Ideal para residências e pequenos escritórios com uso cotidiano.",
            ),
            Plano(
                nome="Starlink Business",
                preco=500.0,
                continente="Região Sul",
                finalidade="Empresarial",
                velocidade_mbps=500,
                descricao="Alta prioridade de rede e SLA para empresas e fazendas.",
            ),
            Plano(
                nome="Starlink Móvel",
                preco=150.0,
                continente="Região Sul",
                finalidade="Móvel",
                velocidade_mbps=150,
                descricao="Uso em veículos terrestres com cobertura em movimento.",
            ),
            # ── América do Norte ─────────────────────────────────────────
            Plano(
                nome="Starlink Residencial",
                preco=120.0,
                continente="Região Norte",
                finalidade="Residencial",
                velocidade_mbps=250,
                descricao="Cobertura residencial com alta velocidade.",
            ),
            Plano(
                nome="Starlink Business",
                preco=500.0,
                continente="Região Norte",
                finalidade="Empresarial",
                velocidade_mbps=1000,
                descricao="Plano empresarial premium com suporte prioritário 24/7.",
            ),
            Plano(
                nome="Starlink Móvel",
                preco=150.0,
                continente="Região Norte",
                finalidade="Móvel",
                velocidade_mbps=150,
                descricao="Uso em veículos terrestres com cobertura em movimento.",
            ),
            Plano(
                nome="Starlink Maritime",
                preco=5000.0,
                continente="Região Norte",
                finalidade="Marítimo",
                velocidade_mbps=350,
                descricao="Conectividade de alta performance para embarcações offshore.",
            ),
            # ── Europa ───────────────────────────────────────────────────
            Plano(
                nome="Starlink Residencial",
                preco=100.0,
                continente="Região Centro-Oeste",
                finalidade="Residencial",
                velocidade_mbps=220,
                descricao="Plano residencial para cobertura na região inteira.",
            ),
            Plano(
                nome="Starlink Móvel",
                preco=150.0,
                continente="Região Centro-Oeste",
                finalidade="Móvel",
                velocidade_mbps=150,
                descricao="Uso em veículos terrestres com cobertura em movimento.",
            ),
            Plano(
                nome="Starlink Business",
                preco=450.0,
                continente="Região Centro-Oeste",
                finalidade="Empresarial",
                velocidade_mbps=700,
                descricao="Conectividade empresarial com foco em uptime e latência baixa.",
            ),
            # ── África ───────────────────────────────────────────────────
            Plano(
                nome="Starlink Residencial",
                preco=110.0,
                continente="Região Sudeste",
                finalidade="Residencial",
                velocidade_mbps=180,
                descricao="Conectividade residencial para regiões remotas.",
            ),
            Plano(
                nome="Starlink Business",
                preco=480.0,
                continente="Região Sudeste",
                finalidade="Empresarial",
                velocidade_mbps=400,
                descricao="Solução empresarial para mineração, agronegócio e telecomunicações.",
            ),
            # ── Ásia ─────────────────────────────────────────────────────
            Plano(
                nome="Starlink Residencial",
                preco=130.0,
                continente="Região Nordeste",
                finalidade="Residencial",
                velocidade_mbps=200,
                descricao="Cobertura residencial para regiões rurais e ilhas o nordeste.",
            ),
            Plano(
                nome="Starlink Móvel",
                preco=165.0,
                continente="Região Nordeste",
                finalidade="Móvel",
                velocidade_mbps=150,
                descricao="Serviço de internet em movimento para todo o nordeste.",
            ),
            Plano(
                nome="Starlink Maritime",
                preco=5000.0,
                continente="Região Nordeste",
                finalidade="Marítimo",
                velocidade_mbps=300,
                descricao="Cobertura marítima no Oceano Atlântico.",
            ),
        ]

    def recomendar(self, continente: str, finalidade: str) -> list[dict]:
        """
        Filtra os planos pelo continente e finalidade informados.

        Separação de Responsabilidades: a regra de negócio fica AQUI,
        não no endpoint Flask nem no frontend.

        Retorna lista de dicts prontos para serialização JSON.
        """
        resultados = [
            plano.to_dict()
            for plano in self._planos
            if plano.continente.lower() == continente.lower()
            and plano.finalidade.lower() == finalidade.lower()
        ]
        return resultados

    def listar_continentes(self) -> list[str]:
        """Retorna continentes únicos disponíveis no catálogo."""
        return sorted({p.continente for p in self._planos})

    def listar_finalidades(self) -> list[str]:
        """Retorna finalidades únicas disponíveis no catálogo."""
        return sorted({p.finalidade for p in self._planos})
