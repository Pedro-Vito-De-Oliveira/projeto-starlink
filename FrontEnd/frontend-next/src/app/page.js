// app/page.js
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

function CardModulo({ titulo, descricao, link, textoBotao, corIcone }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 flex flex-col justify-between hover:border-gray-700 transition-all shadow-xl">
      <div className="space-y-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-800 border border-gray-700 ${corIcone}`}>
          <span className="text-xl">⚡</span>
        </div>
        <h2 className="text-xl font-bold text-white">{titulo}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{descricao}</p>
      </div>
      <div className="mt-6">
        <Link href={link} className="block w-full text-center rounded-lg bg-gray-800 border border-gray-700 py-2.5 text-sm font-semibold text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 transition-colors">
          {textoBotao}
        </Link>
      </div>
    </div>
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
            <path d="M8.5 16.5a5 5 0 0 1 7 0" opacity="0.4"/>
            <path d="M5 12.5a10 10 0 0 1 5.17-2.78"/>
            <path d="M1.42 9a16 16 0 0 1 4.7-2.88"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.54 9"/>
            <path d="M15 12.5a5 5 0 0 1 2.37.68"/>
            <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
          </svg>
        </div>
      </div>

      <div className="text-center space-y-3 max-w-sm">
        <p className="text-xs font-mono text-red-500/70 uppercase tracking-[0.2em]">Erro de conexão</p>
        <h1 className="text-2xl font-bold text-white">API Desconectada</h1>
        <p className="text-sm text-gray-400 leading-relaxed">
          Não foi possível estabelecer comunicação com o servidor backend.
          Verifique se o Flask está rodando em <code className="text-cyan-400 text-xs bg-gray-800 px-1.5 py-0.5 rounded">localhost:5000</code>.
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
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Verificando...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Tentar novamente
          </span>
        )}
      </button>

      <p className="mt-10 text-xs font-mono text-gray-700">STARLINK TERMINAL // BACKEND UNREACHABLE</p>
    </main>
  )
}

// ── Badge de status da API ─────────────────────────────────────────────────────
function StatusBadge({ apiOnline }) {
  if (apiOnline === null) {
    return (
      <span className="text-xs font-mono bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-md text-gray-500 hidden sm:inline-flex items-center gap-1.5">
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        VERIFICANDO
      </span>
    )
  }

  if (apiOnline) {
    return (
      <span className="text-xs font-mono bg-green-950/40 border border-green-500/40 px-2.5 py-1 rounded-md text-green-400 hidden sm:inline-flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none" />
        </svg>
        STATUS: ONLINE
      </span>
    )
  }

  return (
    <span className="text-xs font-mono bg-red-950/40 border border-red-500/40 px-2.5 py-1 rounded-md text-red-400 hidden sm:inline-flex items-center gap-1.5">
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="2" y1="2" x2="22" y2="22" />
        <path d="M8.5 16.5a5 5 0 0 1 7 0" opacity="0.5"/>
        <path d="M5 12.5a10 10 0 0 1 5.17-2.78"/>
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
      </svg>
      STATUS: OFFLINE
    </span>
  )
}

// ── Badge do plano escolhido (clicável) ──────────────────────────────────────
function PlanoBadge({ plano }) {
  if (!plano) return null
  return (
    <Link
      href="/planos"
      className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono bg-cyan-950/30 border border-cyan-500/30 px-2.5 py-1 rounded-md text-cyan-400 hover:border-cyan-400/60 hover:bg-cyan-950/50 transition-all group"
    >
      <svg className="w-3.5 h-3.5 text-cyan-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
      <span className="max-w-[140px] truncate">PLANO: {plano.nome.toUpperCase()}</span>
      <svg className="w-3 h-3 text-cyan-600 group-hover:text-cyan-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [montado, setMontado] = useState(false)
  const [apiOnline, setApiOnline] = useState(null)
  const [planoEscolhido, setPlanoEscolhido] = useState(null)

  const checarApi = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/health`, {
        signal: AbortSignal.timeout(4000),
      })
      setApiOnline(res.ok)
    } catch {
      setApiOnline(false)
    }
  }, [])

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) {
      router.push('/auth')
    } else {
      setUsuario(JSON.parse(dadosSalvos))
    }

    const planoSalvo = localStorage.getItem('plano_starlink')
    if (planoSalvo) setPlanoEscolhido(JSON.parse(planoSalvo))

    setMontado(true)
    checarApi()
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

  if (apiOnline === false) {
    return <TelaApiDesconectada onTentar={checarApi} />
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-lg font-bold tracking-wider uppercase text-cyan-400">Starlink Terminal</span>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge apiOnline={apiOnline} />
          <PlanoBadge plano={planoEscolhido} />
          <Link href="/perfil" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors border border-cyan-500/20 bg-cyan-950/10 px-4 py-2 rounded-lg">
            Meu Perfil
          </Link>
        </div>
      </header>

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center space-y-12">

        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
            Olá, {usuario.nome}!
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Seja bem-vindo ao sistema de gerenciamento de banda larga via satélite. Selecione o módulo desejado abaixo para prosseguir.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto">
          <CardModulo
            titulo="Central de Soluções e Suporte"
            descricao="Está enfrentando problemas de rede, falhas técnicas ou oscilação na velocidade da sua banda larga? Acesse nosso diagnóstico automatizado por POO."
            link="/suporte"
            textoBotao="Abrir Diagnóstico"
            corIcone="text-amber-400"
          />
          <CardModulo
            titulo="Recomendar e Adquirir Planos"
            descricao="Responda nosso questionário inteligente de viabilidade geográfica e finalidade para que o sistema filtre os melhores planos Starlink para você."
            link="/planos"
            textoBotao="Ver Planos Ideais"
            corIcone="text-cyan-400"
          />
        </div>

        <footer className="text-center text-xs font-mono text-gray-600 pt-8">
          SISTEMA OPERACIONAL STARLINK // PROJETO ACADÊMICO POO
        </footer>

      </div>
    </main>
  )
}