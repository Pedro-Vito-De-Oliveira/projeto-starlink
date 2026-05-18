// app/perfil/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState(null)

  // Recupera os dados do usuário salvos no localStorage assim que a página carrega
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) {
      // Se não houver usuário logado, redireciona direto para a tela de login
      router.push('/auth')
    } else {
      setUsuario(JSON.parse(dadosSalvos))
    }
  }, [router])

  // Função para deslogar o usuário
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
        
        {/* Botão de Voltar */}
        <div className="flex justify-start">
          <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-cyan-400 transition-colors flex items-center space-x-1">
            <span>←</span> <span>Voltar ao Painel</span>
          </Link>
        </div>

        {/* Card do Perfil */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Detalhe estético simulando a interface do painel */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600" />

          {/* Cabeçalho do Perfil */}
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
          </div>

          <hr className="border-gray-800" />

          {/* Ações */}
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-red-500/30 bg-red-950/10 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-950/30 hover:border-red-500/50 transition-colors"
          >
            Desconectar Conta
          </button>

        </div>

        {/* Rodapé da página */}
        <p className="text-center text-[10px] font-mono text-gray-600">
          ID DA SESSÃO: {Math.random().toString(36).substring(2, 9).toUpperCase()}
        </p>

      </div>
    </main>
  )
}