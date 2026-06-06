// app/suporte/page.js  ── Página de Suporte Melhorada
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// ── Metadados visuais por tipo de problema ────────────────────────────────────
// (espelha o _MAPA da CentralSuporte no backend)
const META = {
  rede:       { icone: '📡', rotulo: 'Rede',      cor: 'amber',  descCurta: 'Sem conexão ou instabilidade' },
  tecnico:    { icone: '🔧', rotulo: 'Técnico',   cor: 'rose',   descCurta: 'Hardware ou firmware' },
  velocidade: { icone: '⚡', rotulo: 'Velocidade', cor: 'cyan',   descCurta: 'Lentidão ou oscilação' },
}

const COR = {
  amber: {
    borda:   'border-amber-500/40',
    bordaSel: 'border-amber-400 shadow-amber-900/40',
    bg:      'bg-amber-950/30',
    texto:   'text-amber-400',
    badge:   'bg-amber-950/40 border-amber-500/30 text-amber-400',
    step:    'bg-amber-900 text-amber-200',
    btn:     'bg-amber-950/30 border-amber-500/30 text-amber-400 hover:bg-amber-900/40',
  },
  rose: {
    borda:   'border-rose-500/40',
    bordaSel: 'border-rose-400 shadow-rose-900/40',
    bg:      'bg-rose-950/30',
    texto:   'text-rose-400',
    badge:   'bg-rose-950/40 border-rose-500/30 text-rose-400',
    step:    'bg-rose-900 text-rose-200',
    btn:     'bg-rose-950/30 border-rose-500/30 text-rose-400 hover:bg-rose-900/40',
  },
  cyan: {
    borda:   'border-cyan-500/40',
    bordaSel: 'border-cyan-400 shadow-cyan-900/40',
    bg:      'bg-cyan-950/30',
    texto:   'text-cyan-400',
    badge:   'bg-cyan-950/40 border-cyan-500/30 text-cyan-400',
    step:    'bg-cyan-900 text-cyan-200',
    btn:     'bg-cyan-950/30 border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40',
  },
}

// ── Stepper interativo de passos ──────────────────────────────────────────────
// Componente separado: separação de responsabilidades no frontend
function StepperSolucao({ solucao, tipo }) {
  const meta = META[tipo] ?? { cor: 'cyan' }
  const cor = COR[meta.cor]

  // Estado local dos passos concluídos — encapsula lógica do stepper
  const [passosConcluidos, setPassosConcluidos] = useState(new Set())
  const [feedback, setFeedback] = useState(null) // 'resolvido' | 'nao_resolvido' | null

  const total = solucao.passos.length
  const progresso = Math.round((passosConcluidos.size / total) * 100)

  function togglePasso(idx) {
    setPassosConcluidos(prev => {
      const novo = new Set(prev)
      novo.has(idx) ? novo.delete(idx) : novo.add(idx)
      return novo
    })
  }

  function marcarTodos() {
    setPassosConcluidos(new Set(solucao.passos.map((_, i) => i)))
  }

  function reiniciar() {
    setPassosConcluidos(new Set())
    setFeedback(null)
  }

  // Tela de resultado após feedback
  if (feedback === 'resolvido') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-950/20 p-8 text-center space-y-4">
        <div className="text-5xl">✅</div>
        <h3 className="text-xl font-bold text-green-300">Problema resolvido!</h3>
        <p className="text-sm text-gray-400">Que ótimo! Seu chamado foi marcado como <strong className="text-green-400">resolvido</strong>.</p>
        <button
          onClick={reiniciar}
          className="mt-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors border border-gray-700 px-4 py-2 rounded-lg"
        >
          ← Voltar ao diagnóstico
        </button>
      </div>
    )
  }

  if (feedback === 'nao_resolvido') {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="text-4xl">🚨</div>
          <h3 className="text-lg font-bold text-rose-300">Precisamos escalar seu chamado</h3>
          <p className="text-sm text-gray-400">
            Seu problema foi escalado para suporte especializado.
            Nossa equipe entrará em contato em até <strong className="text-white">24 horas</strong>.
          </p>
        </div>
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/30 p-4 space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-rose-500/70">Contato oficial Starlink</p>
          <a
            href="https://www.starlink.com/support"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-rose-300 hover:text-rose-100 underline underline-offset-2 transition-colors"
          >
            starlink.com/support ↗
          </a>
        </div>
        <button
          onClick={reiniciar}
          className="w-full text-xs font-semibold text-gray-400 hover:text-white transition-colors border border-gray-700 px-4 py-2 rounded-lg"
        >
          ← Voltar ao diagnóstico
        </button>
      </div>
    )
  }

  return (
    <section className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-5">

      {/* Cabeçalho da solução */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className={`text-[10px] uppercase tracking-widest font-semibold font-mono ${cor.texto}`}>
            Solução identificada — {meta.rotulo}
          </span>
          <h2 className="mt-1 text-xl font-bold text-white">{solucao.titulo}</h2>
          <p className="mt-1 text-gray-400 text-sm">{solucao.descricao}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-full border ${cor.badge}`}>
          {meta.icone} {meta.rotulo.toUpperCase()}
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{passosConcluidos.size}/{total} passos concluídos</span>
          <span>{progresso}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${meta.cor === 'amber' ? 'bg-amber-500' : meta.cor === 'rose' ? 'bg-rose-500' : 'bg-cyan-500'}`}
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Passos clicáveis */}
      <ol className="space-y-3">
        {solucao.passos.map((passo, i) => {
          const concluido = passosConcluidos.has(i)
          return (
            <li
              key={i}
              onClick={() => togglePasso(i)}
              className={`flex gap-4 rounded-lg border p-3 cursor-pointer select-none transition-all duration-200
                ${concluido
                  ? 'border-gray-700 bg-gray-800/50 opacity-60'
                  : 'border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800/40'
                }`}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all
                ${concluido ? 'bg-green-900 text-green-300' : cor.step}`}
              >
                {concluido ? '✓' : i + 1}
              </div>
              <span className={`text-sm leading-relaxed pt-0.5 transition-colors ${concluido ? 'line-through text-gray-600' : 'text-gray-300'}`}>
                {passo}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Dica: marcar todos */}
      {passosConcluidos.size < total && (
        <button
          onClick={marcarTodos}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Marcar todos como concluídos
        </button>
      )}

      {/* Info de tempo estimado */}
      <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-800 pt-4">
        <span>⏱</span>
        <span>Tempo estimado: <strong className="text-gray-300">{solucao.tempo_estimado}</strong></span>
      </div>

      {/* Feedback — só aparece quando todos os passos forem vistos */}
      <div className="border-t border-gray-800 pt-5 space-y-3">
        <p className="text-sm font-semibold text-white">Isso resolveu o seu problema?</p>
        <div className="flex gap-3">
          <button
            onClick={() => setFeedback('resolvido')}
            className="flex-1 rounded-lg border border-green-500/30 bg-green-950/20 py-2.5 text-sm font-semibold text-green-400 hover:bg-green-900/30 transition-all"
          >
            ✅ Sim, resolveu!
          </button>
          <button
            onClick={() => setFeedback('nao_resolvido')}
            className="flex-1 rounded-lg border border-rose-500/30 bg-rose-950/20 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-900/30 transition-all"
          >
            ❌ Não resolveu
          </button>
        </div>
      </div>
    </section>
  )
}

// ── Skeleton do stepper ───────────────────────────────────────────────────────
function SkeletonStepper() {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-gray-800" />
        <div className="h-6 w-2/3 rounded bg-gray-800" />
        <div className="h-3 w-full rounded bg-gray-800" />
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-800" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-4 rounded-lg border border-gray-800 p-3">
            <div className="w-7 h-7 rounded-full bg-gray-800 shrink-0" />
            <div className="flex-1 space-y-2 pt-0.5">
              <div className="h-3 rounded bg-gray-800" />
              <div className="h-3 w-3/4 rounded bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Página de Suporte ─────────────────────────────────────────────────────────
export default function SuportePage() {
  const router = useRouter()
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [tipos, setTipos] = useState([])
  const [tipoSelecionado, setTipoSelecionado] = useState(null)
  const [solucao, setSolucao] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [carregandoTipos, setCarregandoTipos] = useState(true)
  const [erro, setErro] = useState(null)

  // Proteção de rota
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) { router.push('/auth'); return }
    setUsuarioLogado(JSON.parse(dadosSalvos))
  }, [router])

  // Carrega tipos disponíveis — usa CentralSuporte.tipos_disponiveis() via API
  useEffect(() => {
    if (!usuarioLogado) return
    async function carregarTipos() {
      try {
        const res = await fetch(`${API_URL}/api/suporte/tipos`)
        const data = await res.json()
        setTipos(data.tipos ?? [])
      } catch {
        setErro('Não foi possível conectar à API.')
      } finally {
        setCarregandoTipos(false)
      }
    }
    carregarTipos()
  }, [usuarioLogado])

  // Busca solução — usa CentralSuporte.obter_solucao() + polimorfismo de Problema
  const buscarSolucao = useCallback(async (tipo) => {
    if (tipo === tipoSelecionado && solucao) return // evita refetch desnecessário
    setTipoSelecionado(tipo)
    setSolucao(null)
    setErro(null)
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/suporte/solucao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro ?? 'Erro ao buscar solução.'); return }
      setSolucao(data)
    } catch {
      setErro('Erro de rede ao conectar com a API.')
    } finally {
      setCarregando(false)
    }
  }, [tipoSelecionado, solucao])

  if (!usuarioLogado) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-sm font-mono text-cyan-400 animate-pulse">Verificando autenticação...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Navegação */}
        <div className="flex items-center gap-3 text-xs font-mono text-gray-600">
          <Link href="/" className="hover:text-cyan-400 transition-colors">Painel</Link>
          <span>/</span>
          <span className="text-gray-400">Suporte</span>
        </div>

        {/* Cabeçalho */}
        <header className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">Central de Suporte</h1>
            <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              POO
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            Selecione a categoria do problema para receber o diagnóstico automatizado.
            Cada categoria é uma subclasse de <code className="text-cyan-500/80 text-xs bg-gray-900 px-1.5 py-0.5 rounded">Problema</code>.
          </p>
        </header>

        {/* Erro global */}
        {erro && !solucao && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-red-400 text-sm flex gap-3 items-center">
            <span>⚠️</span>
            {erro}
          </div>
        )}

        {/* Seleção de categoria */}
        <section className="space-y-3">
          <h2 className="text-xs font-mono uppercase tracking-widest text-gray-500">
            Qual é o tipo do problema?
          </h2>

          {carregandoTipos ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-xl border border-gray-800 bg-gray-900 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tipos.map((tipo) => {
                const meta = META[tipo] ?? { icone: '❓', rotulo: tipo, cor: 'cyan', descCurta: '' }
                const cor = COR[meta.cor]
                const selecionado = tipoSelecionado === tipo

                return (
                  <button
                    key={tipo}
                    onClick={() => buscarSolucao(tipo)}
                    disabled={carregando}
                    className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-all duration-200 cursor-pointer disabled:opacity-60
                      ${selecionado
                        ? `${cor.bordaSel} ${cor.bg} shadow-lg`
                        : `border-gray-700 bg-gray-900 hover:border-gray-500 hover:bg-gray-800/60`
                      }`}
                  >
                    <span className="text-4xl">{meta.icone}</span>
                    <div className="text-center">
                      <p className={`font-semibold text-sm tracking-wide ${selecionado ? cor.texto : 'text-white'}`}>
                        {meta.rotulo}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{meta.descCurta}</p>
                    </div>
                    {selecionado && (
                      <span className={`text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full border ${cor.badge}`}>
                        SELECIONADO
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Carregando solução */}
        {carregando && <SkeletonStepper />}

        {/* Solução em stepper interativo */}
        {solucao && !carregando && (
          <StepperSolucao solucao={solucao} tipo={tipoSelecionado} />
        )}

        {/* Nenhum tipo selecionado ainda */}
        {!tipoSelecionado && !carregandoTipos && (
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-8 text-center text-gray-600 text-sm">
            <p className="text-3xl mb-3">🛰️</p>
            <p>Selecione uma categoria acima para iniciar o diagnóstico.</p>
          </div>
        )}

      </div>
    </main>
  )
}