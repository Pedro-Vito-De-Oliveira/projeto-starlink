// app/planos/page.js
// Recomendador de Planos — Starlink Dashboard
//
// Fluxo:
//   1. GET /api/planos/opcoes  → carrega continentes e finalidades para o form
//   2. Usuário seleciona continente + finalidade
//   3. POST /api/planos/recomendar → backend filtra objetos Plano
//   4. Frontend lista os planos recomendados

'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

function CartaoPlano({ plano }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-3 hover:border-cyan-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-white">{plano.nome}</h3>
        <span className="shrink-0 rounded-md bg-cyan-900/50 px-2 py-0.5 text-xs text-cyan-300 font-semibold border border-cyan-800">
          {plano.finalidade}
        </span>
      </div>
      <p className="text-sm text-gray-400">{plano.descricao}</p>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Preco</span>
          <span className="font-bold text-white">
            US$ {plano.preco.toLocaleString('pt-BR')}
            <span className="text-gray-400 font-normal">/mes</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Velocidade</span>
          <span className="font-bold text-white">
            {plano.velocidade_mbps}
            <span className="text-gray-400 font-normal"> Mbps</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Regiao</span>
          <span className="text-gray-300">{plano.continente}</span>
        </div>
      </div>
    </div>
  )
}

export default function PlanosPage() {
  const [continentes, setContinentes] = useState([])
  const [finalidades, setFinalidades] = useState([])
  const [continente, setContinente] = useState('')
  const [finalidade, setFinalidade] = useState('')
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const res = await fetch(`${API_URL}/api/planos/opcoes`)
        const data = await res.json()
        setContinentes(data.continentes ?? [])
        setFinalidades(data.finalidades ?? [])
      } catch {
        setErro('Nao foi possivel conectar a API.')
      }
    }
    carregarOpcoes()
  }, [])

  async function buscarPlanos() {
    if (!continente || !finalidade) {
      setErro('Selecione continente e finalidade para continuar.')
      return
    }
    setErro(null)
    setResultado(null)
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/planos/recomendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ continente, finalidade }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro ?? 'Erro ao buscar recomendacoes.'); return }
      setResultado(data)
    } catch {
      setErro('Erro de rede ao conectar com a API.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">Recomendador de Planos</h1>
          <p className="mt-2 text-gray-400">Responda duas perguntas e descubra o plano Starlink ideal.</p>
        </header>

        <section className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-300">Em qual continente voce esta?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {continentes.map((c) => (
                <button key={c} onClick={() => setContinente(c)}
                  className={`rounded-lg border px-3 py-2 text-sm text-left transition-all
                    ${continente === c ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-300">Qual e a finalidade do seu plano?</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {finalidades.map((f) => (
                <button key={f} onClick={() => setFinalidade(f)}
                  className={`rounded-lg border px-3 py-2 text-sm text-left transition-all
                    ${finalidade === f ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button onClick={buscarPlanos} disabled={carregando || !continente || !finalidade}
            className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-gray-950 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {carregando ? 'Buscando planos...' : 'Ver planos recomendados'}
          </button>
        </section>

        {erro && (
          <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-4 text-red-400 text-sm">{erro}</div>
        )}

        {resultado && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-300">
                {resultado.total > 0 ? `${resultado.total} plano(s) encontrado(s)` : 'Nenhum plano encontrado.'}
              </h2>
              {resultado.total > 0 && (
                <span className="text-xs text-gray-500">{resultado.continente} · {resultado.finalidade}</span>
              )}
            </div>
            {resultado.planos.map((plano, i) => (
              <CartaoPlano key={i} plano={plano} />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}
