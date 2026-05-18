// app/suporte/page.js
// Central de Suporte — Starlink Dashboard
//
// Fluxo:
//   1. GET /api/suporte/tipos → carrega os tipos disponíveis ao montar
//   2. Usuário clica em um tipo de problema
//   3. POST /api/suporte/solucao → backend instancia a subclasse correta (polimorfismo)
//   4. Frontend renderiza o passo a passo retornado

'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// Ícones por tipo de problema
const ICONES = {
  rede: '📡',
  tecnico: '🔧',
  velocidade: '⚡',
}

// Rótulos legíveis para exibição
const ROTULOS = {
  rede: 'Rede',
  tecnico: 'Técnico',
  velocidade: 'Velocidade',
}

export default function SuportePage() {
  const [tipos, setTipos] = useState([])
  const [tipoSelecionado, setTipoSelecionado] = useState(null)
  const [solucao, setSolucao] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  // ── 1. Carrega tipos disponíveis ao montar o componente ────────────────
  useEffect(() => {
    async function carregarTipos() {
      try {
        const res = await fetch(`${API_URL}/api/suporte/tipos`)
        const data = await res.json()
        setTipos(data.tipos ?? [])
      } catch {
        setErro('Não foi possível conectar à API. Verifique se o backend Flask está rodando.')
      }
    }
    carregarTipos()
  }, [])

  // ── 2. Busca solução ao clicar em um tipo ──────────────────────────────
  async function buscarSolucao(tipo) {
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

      if (!res.ok) {
        setErro(data.erro ?? 'Erro ao buscar solução.')
        return
      }

      setSolucao(data)
    } catch {
      setErro('Erro de rede ao conectar com a API.')
    } finally {
      setCarregando(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Cabeçalho */}
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">
            Central de Suporte
          </h1>
          <p className="mt-2 text-gray-400">
            Selecione a categoria do seu problema para receber o passo a passo de solução.
          </p>
        </header>

        {/* Erro de conexão */}
        {erro && !solucao && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-red-400 text-sm">
            {erro}
          </div>
        )}

        {/* Cartões de seleção */}
        {tipos.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tipos.map((tipo) => (
              <button
                key={tipo}
                onClick={() => buscarSolucao(tipo)}
                className={`
                  flex flex-col items-center gap-3 rounded-xl border p-6
                  transition-all duration-200 cursor-pointer
                  ${tipoSelecionado === tipo
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-900/30'
                    : 'border-gray-700 bg-gray-900 hover:border-gray-500'}
                `}
              >
                <span className="text-4xl">{ICONES[tipo] ?? '❓'}</span>
                <span className="font-semibold text-sm tracking-wide">
                  {ROTULOS[tipo] ?? tipo}
                </span>
              </button>
            ))}
          </section>
        )}

        {/* Carregando */}
        {carregando && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <span>Consultando solução...</span>
          </div>
        )}

        {/* Resultado */}
        {solucao && (
          <section className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">
                Solução identificada
              </span>
              <h2 className="mt-1 text-xl font-bold">{solucao.titulo}</h2>
              <p className="mt-1 text-gray-400 text-sm">{solucao.descricao}</p>
            </div>

            {/* Passo a passo */}
            <ol className="space-y-3">
              {solucao.passos.map((passo, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center
                                   rounded-full bg-cyan-900 text-cyan-300 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-300 leading-relaxed pt-0.5">
                    {passo}
                  </span>
                </li>
              ))}
            </ol>

            {/* Tempo estimado */}
            <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-800 pt-4">
              <span>⏱</span>
              <span>
                Tempo estimado:{' '}
                <strong className="text-gray-300">{solucao.tempo_estimado}</strong>
              </span>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
