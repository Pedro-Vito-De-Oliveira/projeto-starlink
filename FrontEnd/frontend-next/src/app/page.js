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
  if (!plano) return null
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-gray-900 p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center text-lg shrink-0">
          🛰️
        </div>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-cyan-500/70">Plano ativo</p>
          <p className="text-sm font-bold text-cyan-300">{plano.nome}</p>
          <p className="text-xs text-gray-500">{plano.regiao} · {plano.velocidade_mbps} Mbps · R$ {plano.preco?.toFixed(2)}/mês</p>
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

// ── Histórico de chamados recentes ────────────────────────────────────────────
function HistoricoSuporte({ historico }) {
  if (!historico || historico.length === 0) return null

  const ICONES = { rede: '📡', tecnico: '🔧', velocidade: '⚡' }
  const STATUS_ESTILO = {
    resolvido: 'text-green-400 bg-green-950/40 border-green-500/30',
    aberto: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-mono uppercase tracking-widest text-gray-500">Chamados recentes</h3>
      <div className="space-y-2">
        {historico.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{ICONES[ticket.tipo] ?? '❓'}</span>
              <div>
                <p className="text-sm font-semibold text-white capitalize">{ticket.tipo}</p>
                <p className="text-xs text-gray-500">{ticket.data}</p>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-full border ${STATUS_ESTILO[ticket.status] ?? 'text-gray-400 bg-gray-800 border-gray-700'}`}>
              {ticket.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </section>
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

  // Histórico simulado de chamados — em produção virá de GET /api/suporte/historico/:username
  // Classe POO envolvida no backend: TicketSuporte (encapsulamento + status)
  const [historico] = useState([
    { id: '1', tipo: 'rede', status: 'resolvido', data: 'Hoje, 09:14' },
    { id: '2', tipo: 'velocidade', status: 'aberto', data: 'Ontem, 18:32' },
  ])

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

    setMontado(true)
    checarApi()

    // Simula delay de carregamento dos módulos para mostrar skeleton
    setTimeout(() => setCarregandoModulos(false), 800)

    const intervalo = setInterval(checarApi, 30000)
    return () => clearInterval(intervalo)
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

        {/* Card do plano ativo (só aparece se houver plano salvo) */}
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
                descricao="Diagnóstico automatizado por POO. Selecione a categoria do problema e receba o passo a passo de solução."
                link="/suporte"
                textoBotao="Abrir Diagnóstico"
                icone="📡"
                corBorda="border-amber-500/30 hover:border-amber-400/60"
                corIconeBg="bg-amber-900/30 border border-amber-500/20"
                corTexto="border-amber-500/30 bg-amber-950/20 text-amber-400 hover:bg-amber-900/40 hover:text-amber-300"
                badge="POO"
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

        {/* Histórico de chamados recentes */}
        <HistoricoSuporte historico={historico} />

        {/* Rodapé */}
        <footer className="text-center text-xs font-mono text-gray-700 pt-4 border-t border-gray-900">
          SISTEMA OPERACIONAL STARLINK // PROJETO ACADÊMICO POO
        </footer>
      </div>
    </main>
  )
}