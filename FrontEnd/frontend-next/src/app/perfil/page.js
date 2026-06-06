// app/perfil/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)
  const [planoEscolhido, setPlanoEscolhido] = useState(null)

  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) {
      router.push('/auth')
    } else {
      setUsuario(JSON.parse(dadosSalvos))
    }
    const planoSalvo = localStorage.getItem('plano_starlink')
    if (planoSalvo) setPlanoEscolhido(JSON.parse(planoSalvo))
  }, [router])

  function handleLogout() {
    localStorage.removeItem('usuario_starlink')
    router.push('/auth')
  }

  if (!usuario) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-sm font-mono text-cyan-400 animate-pulse">Carregando credenciais...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        <div className="flex justify-start">
          <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-cyan-400 transition-colors flex items-center space-x-1">
            <span>←</span> <span>Voltar ao Painel</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

          {/* Avatar */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 bg-gray-800 border-2 border-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-md">
              <span className="text-3xl text-cyan-400 font-bold uppercase">
                {usuario.nome ? usuario.nome[0] : 'U'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{usuario.nome}</h1>
            <p className="text-sm text-cyan-400 font-mono">@{usuario.username}</p>
          </div>

          <hr className="border-gray-800" />

          {/* Dados da Conta */}
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Endereço de E-mail</span>
              <p className="text-sm bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-gray-300 font-mono">
                {usuario.email}
              </p>
            </div>

            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status da Conta</span>
              <div className="flex items-center space-x-2 bg-gray-950 border border-gray-800 rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-sm text-green-400 font-semibold font-mono">Autenticado via API (POO)</p>
              </div>
            </div>

            {/* Plano escolhido */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">Plano Contratado</span>
              {planoEscolhido ? (
                <Link
                  href="/planos"
                  className="flex items-center justify-between bg-gray-950 border border-cyan-500/30 rounded-lg px-3 py-2.5 hover:border-cyan-400/60 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-bold text-cyan-300">{planoEscolhido.nome}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {planoEscolhido.faixa.velocidade} Mbps · R$ {planoEscolhido.faixa.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês · {planoEscolhido.regiao}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/planos"
                  className="flex items-center justify-between bg-gray-950 border border-gray-800 rounded-lg px-3 py-2.5 hover:border-gray-600 transition-colors group"
                >
                  <p className="text-sm text-gray-500 italic">Nenhum plano escolhido</p>
                  <svg className="w-4 h-4 text-gray-700 group-hover:text-gray-400 transition-colors shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          </div>

          <hr className="border-gray-800" />

          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/30 bg-red-950/10 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-950/30 hover:border-red-500/50 transition-colors"
          >
            Desconectar Conta
          </button>
        </div>

        <p className="text-center text-[10px] font-mono text-gray-600">
          ID DA SESSÃO: {Math.random().toString(36).substring(2, 9).toUpperCase()}
        </p>

      </div>
    </main>
  )
}