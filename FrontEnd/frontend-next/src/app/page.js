// app/page.js
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

export default function HomePage() {
  const router = useRouter()
  // Começa como null — servidor e cliente renderizam igual (resolve o hydration)
  const [usuario, setUsuario] = useState(null)
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    // Só roda no cliente, nunca no servidor
    const dadosSalvos = localStorage.getItem('usuario_starlink')
    if (!dadosSalvos) {
      router.push('/auth')
    } else {
      setUsuario(JSON.parse(dadosSalvos))
    }
    setMontado(true)
  }, [router])

  // Enquanto não montou no cliente, servidor e cliente mostram o mesmo — sem conflito
  if (!montado || !usuario) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-sm font-mono text-cyan-400 animate-pulse">Verificando autenticação...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-lg font-bold tracking-wider uppercase text-cyan-400">Starlink Terminal</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs font-mono bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-md text-gray-400 hidden sm:inline-block">
            STATUS: ONLINE
          </span>
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