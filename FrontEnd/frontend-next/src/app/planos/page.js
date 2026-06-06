// app/planos/page.js
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// Gera faixas fixas de velocidade até o máximo do plano
// Faixas: 25%, 50%, 75%, 100% da velocidade máxima
function gerarFaixas(velocidadeMax, precoBase) {
  const porcentagens = [0.25, 0.50, 0.75, 1.0]
  return porcentagens.map((p) => {
    const velocidade = Math.round(velocidadeMax * p)
    const preco = parseFloat((precoBase * p).toFixed(2))
    return { velocidade, preco, label: `${velocidade} Mbps` }
  })
}

function CartaoPlano({ plano }) {
  const faixas = gerarFaixas(plano.velocidade_mbps, plano.preco)
  const [faixaSelecionada, setFaixaSelecionada] = useState(faixas[faixas.length - 1])

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 space-y-4 hover:border-cyan-700 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-white">{plano.nome}</h3>
        <span className="shrink-0 rounded-md bg-cyan-900/50 px-2 py-0.5 text-xs text-cyan-300 font-semibold border border-cyan-800">
          {plano.finalidade}
        </span>
      </div>

      <p className="text-sm text-gray-400">{plano.descricao}</p>

      {/* Seletor de faixa de velocidade */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Velocidade desejada</span>
          <span className="text-xs text-gray-500">máx. {plano.velocidade_mbps} Mbps</span>
        </div>
        <select
          value={faixaSelecionada.velocidade}
          onChange={(e) => {
            const v = parseInt(e.target.value)
            setFaixaSelecionada(faixas.find((f) => f.velocidade === v))
          }}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none cursor-pointer"
        >
          {faixas.map((f) => (
            <option key={f.velocidade} value={f.velocidade}>
              {f.velocidade} Mbps — R$ {f.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
            </option>
          ))}
        </select>
      </div>

      {/* Resumo do plano com faixa selecionada */}
      <div className="flex flex-wrap items-center gap-6 text-sm pt-1 border-t border-gray-800">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Preço</span>
          <span className="font-bold text-cyan-300 text-base">
            R$ {faixaSelecionada.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            <span className="text-gray-400 font-normal text-sm">/mês</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Velocidade</span>
          <span className="font-bold text-white">
            {faixaSelecionada.velocidade}
            <span className="text-gray-400 font-normal"> Mbps</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 uppercase tracking-wide">Região</span>
          <span className="text-gray-300">{plano.regiao}</span>
        </div>
      </div>
    </div>
  )
}

export default function PlanosPage() {
  const router = useRouter()
  const [usuarioLogado, setUsuarioLogado] = useState(null)
  const [regioes, setRegioes] = useState([])
  const [finalidades, setFinalidades] = useState([])
  const [regiao, setRegiao] = useState('')
  const [finalidade, setFinalidade] = useState('')
  const [resultado, setResultado] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) {
      router.push('/auth')
    } else {
      setUsuarioLogado(JSON.parse(dadosSalvos))
    }
  }, [router])

  useEffect(() => {
    if (!usuarioLogado) return
    async function carregarOpcoes() {
      try {
        const res = await fetch(`${API_URL}/api/planos/opcoes`)
        const data = await res.json()
        setRegioes(data.regioes ?? [])
        setFinalidades(data.finalidades ?? [])
      } catch {
        setErro('Não foi possível conectar à API.')
      }
    }
    carregarOpcoes()
  }, [usuarioLogado])

  async function buscarPlanos() {
    if (!regiao || !finalidade) {
      setErro('Selecione a região e a finalidade para continuar.')
      return
    }
    setErro(null)
    setResultado(null)
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/planos/recomendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regiao, finalidade }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro ?? 'Erro ao buscar recomendações.'); return }
      setResultado(data)
    } catch {
      setErro('Erro de rede ao conectar com a API.')
    } finally {
      setCarregando(false)
    }
  }

  if (!usuarioLogado) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-sm font-mono text-cyan-400 animate-pulse">Verificando autenticação...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        <div className="flex justify-start">
          <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-cyan-400 transition-colors flex items-center space-x-1">
            <span>←</span> <span>Voltar ao Painel</span>
          </Link>
        </div>

        <header>
          <h1 className="text-3xl font-bold tracking-tight text-cyan-400">Recomendador de Planos</h1>
          <p className="mt-2 text-gray-400">Responda duas perguntas e descubra o plano Starlink ideal.</p>
        </header>

        <section className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-300">Em qual região você está?</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {regioes.map((r) => (
                <button key={r} onClick={() => setRegiao(r)}
                  className={`rounded-lg border px-3 py-2 text-sm text-left transition-all
                    ${regiao === r ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-300">Qual é a finalidade do seu plano?</p>
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

          <button onClick={buscarPlanos} disabled={carregando || !regiao || !finalidade}
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
                <span className="text-xs text-gray-500">{resultado.regiao} · {resultado.finalidade}</span>
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