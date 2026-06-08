// app/page.js  ── Página Principal Melhorada
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// ── Utilitário: hora do dia ───────────────────────────────────────────────────
function getSaudacao(nome) {
  const h = new Date().getHours()
  const periodo = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
  return `${periodo}, ${nome}!`
}

// ── Helpers de chamados no localStorage ──────────────────────────────────────
const STORAGE_KEY_CHAMADOS = 'starlink_chamados'

export function salvarChamado(tipo) {
  const chamados = lerChamados()
  const novo = {
    id: Date.now().toString(),
    tipo,
    status: 'aberto',
    data: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
  }
  // mantém até 10 chamados recentes
  const atualizados = [novo, ...chamados].slice(0, 10)
  localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(atualizados))
  window.dispatchEvent(new Event('starlink_chamados_update'))
  return novo.id
}

export function finalizarChamado(id, novoStatus = 'resolvido') {
  const chamados = lerChamados().map(c =>
    c.id === id ? { ...c, status: novoStatus } : c
  )
  localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(chamados))
  window.dispatchEvent(new Event('starlink_chamados_update'))
}

function lerChamados() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CHAMADOS) ?? '[]')
  } catch {
    return []
  }
}

// ── Skeleton de carregamento ──────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 animate-pulse space-y-4">
      <div className="w-12 h-12 rounded-xl bg-gray-800" />
      <div className="h-5 w-2/3 rounded bg-gray-800" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-gray-800" />
        <div className="h-3 w-4/5 rounded bg-gray-800" />
      </div>
      <div className="h-9 rounded-lg bg-gray-800 mt-4" />
    </div>
  )
}

// ── Card de módulo ────────────────────────────────────────────────────────────
function CardModulo({ titulo, descricao, link, textoBotao, icone, corBorda, corIconeBg, corTexto, badge }) {
  return (
    <div className={`rounded-2xl border ${corBorda} bg-gray-900 p-6 flex flex-col justify-between hover:brightness-110 transition-all duration-300 shadow-xl group`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${corIconeBg}`}>
            <span className="text-2xl">{icone}</span>
          </div>
          {badge && (
            <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              {badge}
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-snug">{titulo}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{descricao}</p>
      </div>
      <div className="mt-6">
        <Link
          href={link}
          className={`block w-full text-center rounded-lg border py-2.5 text-sm font-semibold transition-all duration-200 ${corTexto}`}
        >
          {textoBotao} →
        </Link>
      </div>
    </div>
  )
}

// ── Card de resumo do plano ───────────────────────────────────────────────────
function CardPlanoAtivo({ plano }) {
  if (!plano) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-800/60 border border-gray-700 flex items-center justify-center text-lg shrink-0">
            🛰️
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600">Plano ativo</p>
            <p className="text-sm font-semibold text-gray-500">Nenhum plano selecionado</p>
            <p className="text-xs text-gray-700">Escolha um plano para começar</p>
          </div>
        </div>
        <Link
          href="/planos"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors whitespace-nowrap border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-950/50"
        >
          Ver planos →
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-gray-900 p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center text-lg shrink-0">
          🛰️
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70">Plano ativo</p>
          <p className="text-sm font-bold text-cyan-300">{plano.nome}</p>
          <p className="text-xs text-gray-400">
            {plano.regiao}
            {plano.velocidade_mbps ? ` · ${plano.velocidade_mbps} Mbps` : ''}
            {plano.preco != null ? ` · R$ ${Number(plano.preco).toFixed(2)}/mês` : ''}
          </p>
        </div>
      </div>
      <Link
        href="/planos"
        className="text-xs font-semibold text-cyan-400 hover:text-cyan-200 transition-colors whitespace-nowrap border border-cyan-500/20 px-3 py-1.5 rounded-lg hover:bg-cyan-950/50"
      >
        Trocar plano
      </Link>
    </div>
  )
}

// ── Modal de confirmação ──────────────────────────────────────────────────────
function ModalConfirmacao({ mensagem, onConfirmar, onCancelar }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancelar} />
      <div className="relative rounded-2xl border border-amber-500/30 bg-gray-900 p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/40 border border-amber-500/30 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <p className="text-sm font-bold text-white">Tem certeza?</p>
            <p className="text-xs text-gray-400 mt-0.5">{mensagem}</p>
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancelar}
            className="flex-1 rounded-lg border border-gray-700 bg-gray-800 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 rounded-lg border border-red-500/40 bg-red-950/30 py-2 text-xs font-semibold text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all"
          >
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Histórico de chamados recentes — atualiza em tempo real ──────────────────
function HistoricoSuporte() {
  const [historico, setHistorico] = useState([])
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null)
  const [piscando, setPiscando] = useState(false)
  // confirmacao: null | { tipo: 'um', id: string } | { tipo: 'todos' }
  const [confirmacao, setConfirmacao] = useState(null)

  const ICONES = { rede: '📡', tecnico: '🔧', velocidade: '⚡' }
  const STATUS_ESTILO = {
    resolvido:    'text-green-400 bg-green-950/40 border-green-500/30',
    aberto:       'text-amber-400 bg-amber-950/40 border-amber-500/30',
    nao_resolvido:'text-rose-400 bg-rose-950/40 border-rose-500/30',
  }
  const STATUS_LABEL = {
    resolvido:     'RESOLVIDO',
    aberto:        'ABERTO',
    nao_resolvido: 'ESCALADO',
  }

  const carregar = useCallback(() => {
    const dados = lerChamados()
    setHistorico(dados)
    setUltimaAtualizacao(new Date())
    setPiscando(true)
    setTimeout(() => setPiscando(false), 600)
  }, [])

  useEffect(() => {
    carregar()
    window.addEventListener('starlink_chamados_update', carregar)
    const intervalo = setInterval(carregar, 5000)
    const onStorage = (e) => { if (e.key === STORAGE_KEY_CHAMADOS) carregar() }
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener('starlink_chamados_update', carregar)
      window.removeEventListener('storage', onStorage)
      clearInterval(intervalo)
    }
  }, [carregar])

  function excluirUm(id) {
    const atualizados = lerChamados().filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify(atualizados))
    window.dispatchEvent(new Event('starlink_chamados_update'))
    setConfirmacao(null)
  }

  function limparTodos() {
    localStorage.setItem(STORAGE_KEY_CHAMADOS, JSON.stringify([]))
    window.dispatchEvent(new Event('starlink_chamados_update'))
    setConfirmacao(null)
  }

  const temAbertos = historico.some(c => c.status === 'aberto')

  return (
    <>
      {/* Modal de confirmação */}
      {confirmacao?.tipo === 'um' && (
        <ModalConfirmacao
          mensagem="Este chamado ainda está em aberto. Deseja mesmo excluí-lo?"
          onConfirmar={() => excluirUm(confirmacao.id)}
          onCancelar={() => setConfirmacao(null)}
        />
      )}
      {confirmacao?.tipo === 'todos' && (
        <ModalConfirmacao
          mensagem="Todos os chamados serão removidos permanentemente."
          onConfirmar={limparTodos}
          onCancelar={() => setConfirmacao(null)}
        />
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500">
            Chamados recentes
          </h3>
          <div className="flex items-center gap-3">
            {ultimaAtualizacao && (
              <span className="text-[10px] font-mono text-gray-700">
                Atualizado {ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${piscando ? 'bg-cyan-400' : 'bg-gray-700'}`} />
            {historico.length > 0 && (
              <button
                onClick={() => setConfirmacao({ tipo: 'todos' })}
                className="text-[10px] font-mono font-semibold text-red-500/60 hover:text-red-400 transition-colors border border-red-500/20 hover:border-red-500/40 px-2 py-1 rounded-md"
              >
                Limpar tudo
              </button>
            )}
          </div>
        </div>

        {historico.length === 0 ? (
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-6 text-center">
            <p className="text-xs text-gray-600 font-mono">Nenhum chamado registrado ainda.</p>
            <Link href="/suporte" className="text-xs text-cyan-600 hover:text-cyan-400 mt-1 block transition-colors">
              Abrir um chamado →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {historico.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{ICONES[ticket.tipo] ?? '❓'}</span>
                  <div>
                    <p className="text-sm font-semibold text-white capitalize">{ticket.tipo}</p>
                    <p className="text-xs text-gray-500">{ticket.data}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-full border ${STATUS_ESTILO[ticket.status] ?? 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                    {STATUS_LABEL[ticket.status] ?? ticket.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() =>
                      ticket.status === 'aberto'
                        ? setConfirmacao({ tipo: 'um', id: ticket.id })
                        : excluirUm(ticket.id)
                    }
                    title="Excluir chamado"
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400 p-1 rounded-md hover:bg-red-950/30"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

// ── Tela de API Desconectada ──────────────────────────────────────────────────
function TelaApiDesconectada({ onTentar }) {
  const [tentando, setTentando] = useState(false)

  async function handleTentar() {
    setTentando(true)
    await onTentar()
    setTentando(false)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute w-32 h-32 rounded-full bg-red-500/10 animate-ping" />
        <div className="absolute w-24 h-24 rounded-full bg-red-500/15" />
        <div className="relative w-20 h-20 rounded-full bg-gray-900 border-2 border-red-500/60 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <svg className="w-9 h-9 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="2" x2="22" y2="22" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" opacity="0.4" />
            <path d="M5 12.5a10 10 0 0 1 5.17-2.78" />
            <path d="M1.42 9a16 16 0 0 1 4.7-2.88" />
            <path d="M10.71 5.05A16 16 0 0 1 22.54 9" />
            <path d="M15 12.5a5 5 0 0 1 2.37.68" />
            <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
          </svg>
        </div>
      </div>
      <div className="text-center space-y-3 max-w-sm">
        <p className="text-xs font-mono text-red-500/70 uppercase tracking-[0.2em]">Erro de conexão</p>
        <h1 className="text-2xl font-bold text-white">API Desconectada</h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          Não foi possível comunicar com o backend.
          Verifique se o Flask está em{' '}
          <code className="text-cyan-400 text-xs bg-gray-800 px-1.5 py-0.5 rounded">localhost:5000</code>.
        </p>
      </div>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/20 px-4 py-2">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span className="text-xs font-mono text-red-400">STATUS: OFFLINE</span>
      </div>
      <button
        onClick={handleTentar}
        disabled={tentando}
        className="mt-8 rounded-lg border border-gray-700 bg-gray-800 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {tentando ? (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            Verificando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
            Tentar novamente
          </span>
        )}
      </button>
      <p className="mt-10 text-xs font-mono text-gray-700">STARLINK TERMINAL // BACKEND UNREACHABLE</p>
    </main>
  )
}

// ── Badge de status da API ────────────────────────────────────────────────────
function StatusBadge({ apiOnline }) {
  if (apiOnline === null)
    return (
      <span className="text-xs font-mono bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-md text-gray-500 hidden sm:inline-flex items-center gap-1.5">
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
        VERIFICANDO
      </span>
    )
  if (apiOnline)
    return (
      <span className="text-xs font-mono bg-green-950/40 border border-green-500/40 px-2.5 py-1 rounded-md text-green-400 hidden sm:inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        STATUS: ONLINE
      </span>
    )
  return (
    <span className="text-xs font-mono bg-red-950/40 border border-red-500/40 px-2.5 py-1 rounded-md text-red-400 hidden sm:inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      STATUS: OFFLINE
    </span>
  )
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [montado, setMontado] = useState(false)
  const [apiOnline, setApiOnline] = useState(null)
  const [planoEscolhido, setPlanoEscolhido] = useState(null)
  const [carregandoModulos, setCarregandoModulos] = useState(true)

  const checarApi = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/health`, { signal: AbortSignal.timeout(4000) })
      setApiOnline(res.ok)
    } catch {
      setApiOnline(false)
    }
  }, [])

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) {
      router.push('/auth')
      return
    }
    setUsuario(JSON.parse(dadosSalvos))

    const planoSalvo = localStorage.getItem('plano_starlink')
    if (planoSalvo) setPlanoEscolhido(JSON.parse(planoSalvo))

    // Detecta se o plano mudou em outra aba / página de planos
    function onStorage(e) {
      if (e.key === 'plano_starlink') {
        setPlanoEscolhido(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', onStorage)

    setMontado(true)
    checarApi()

    setTimeout(() => setCarregandoModulos(false), 800)

    const intervalo = setInterval(checarApi, 30000)
    return () => {
      clearInterval(intervalo)
      window.removeEventListener('storage', onStorage)
    }
  }, [router, checarApi])

  if (!montado || !usuario) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-sm font-mono text-cyan-400 animate-pulse">Verificando autenticação...</p>
      </main>
    )
  }

  if (apiOnline === false) return <TelaApiDesconectada onTentar={checarApi} />

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header sticky */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-lg font-bold tracking-wider uppercase text-cyan-400">Starlink Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge apiOnline={apiOnline} />
          <Link
            href="/perfil"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 bg-cyan-950/10 px-4 py-2 rounded-lg"
          >
            Meu Perfil
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-10">

        {/* Saudação personalizada */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            {getSaudacao(usuario.nome)}
          </h1>
          <p className="text-gray-500 text-sm">
            Bem-vindo ao sistema de gerenciamento Starlink. O que você precisa hoje?
          </p>
        </div>

        {/* Card do plano ativo — sempre exibido, com ou sem plano */}
        <CardPlanoAtivo plano={planoEscolhido} />

        {/* Módulos principais — com skeleton durante o carregamento */}
        <section className="space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500">Módulos do sistema</h2>

          {carregandoModulos ? (
            <div className="grid md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              <CardModulo
                titulo="Central de Suporte"
                descricao="Diagnóstico automatizado. Selecione a categoria do problema e receba o passo a passo de solução."
                link="/suporte"
                textoBotao="Abrir Diagnóstico"
                icone="📡"
                corBorda="border-amber-500/30 hover:border-amber-400/60"
                corIconeBg="bg-amber-900/30 border border-amber-500/20"
                corTexto="border-amber-500/30 bg-amber-950/20 text-amber-400 hover:bg-amber-900/40 hover:text-amber-300"
                
              />
              <CardModulo
                titulo="Planos & Recomendação"
                descricao="Questionário inteligente de viabilidade geográfica para filtrar os melhores planos Starlink para você."
                link="/planos"
                textoBotao="Ver Planos Ideais"
                icone="🛰️"
                corBorda="border-cyan-500/30 hover:border-cyan-400/60"
                corIconeBg="bg-cyan-900/30 border border-cyan-500/20"
                corTexto="border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-900/40 hover:text-cyan-300"
              />
            </div>
          )}
        </section>

        {/* Histórico de chamados — atualização em tempo real via localStorage */}
        <HistoricoSuporte />

        {/* Rodapé */}
        <footer className="text-center text-xs font-mono text-gray-700 pt-4 border-t border-gray-900">
          SISTEMA OPERACIONAL STARLINK // PROJETO ACADÊMICO POO
        </footer>
      </div>
    </main>
  )
}