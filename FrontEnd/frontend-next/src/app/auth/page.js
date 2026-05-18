// app/auth/page.js
// Autenticação — Login e Cadastro
//
// Fluxo login  : POST /api/login  → backend chama Usuario.autenticar()
// Fluxo cadastro: POST /api/cadastro → backend instancia Usuario e chama .cadastrar()

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // Adicionado para gerenciar o redirecionamento

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

// ── Sub-componentes reutilizáveis ─────────────────────────────────────────

function Input({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm
                   text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none
                   focus:ring-1 focus:ring-cyan-500"
      />
    </div>
  )
}

function Botao({ onClick, carregando, label }) {
  return (
    <button
      onClick={onClick}
      disabled={carregando}
      className="w-full rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold
                 text-gray-950 hover:bg-cyan-400 disabled:opacity-40
                 disabled:cursor-not-allowed transition-colors"
    >
      {carregando ? 'Aguarde...' : label}
    </button>
  )
}

// ── Componente principal ──────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter() // Inicializando o roteador do Next.js
  const [aba, setAba] = useState('login')           // 'login' | 'cadastro'
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [perfil, setPerfil] = useState(null)

  // Campos do formulário
  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function limparEstado() {
    setErro(null)
    setSucesso(null)
    setPerfil(null)
  }

  // ── Handler de Login ────────────────────────────────────────────────────
  async function handleLogin() {
    limparEstado()
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro); return }
      
      setPerfil(data.perfil)
      
      // ── O LOCAL EXATO DA ADIÇÃO É AQUI ──────────────────────────────────
      // 1. Salva os dados do perfil retornados pelo Flask no navegador
      localStorage.setItem('usuario_starlink', JSON.stringify(data.perfil))
      
      setSucesso(`Bem-vindo(a), ${data.perfil.nome}! Redirecionando...`)

      // 2. Aguarda 1.5 segundos exibindo o sucesso e joga para a Home corrigida
      setTimeout(() => {
        router.push('/')
      }, 1500)
      // ────────────────────────────────────────────────────────────────────

    } catch {
      setErro('Erro de rede. Verifique se o backend Flask está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  // ── Handler de Cadastro ─────────────────────────────────────────────────
  async function handleCadastro() {
    limparEstado()
    setCarregando(true)
    try {
      const res = await fetch(`${API_URL}/api/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, username, email, senha }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.erro); return }
      setSucesso('Cadastro realizado! Faça login para continuar.')
      setAba('login')
    } catch {
      setErro('Erro de rede. Verifique se o backend Flask está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Título */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400">Starlink Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Gerenciamento de conectividade</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6 space-y-6">

          {/* Abas */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {['login', 'cadastro'].map((t) => (
              <button
                key={t}
                onClick={() => { setAba(t); limparEstado() }}
                className={`flex-1 py-2 text-sm font-semibold capitalize transition-colors
                  ${aba === t ? 'bg-cyan-500 text-gray-950' : 'text-gray-400 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Mensagens */}
          {sucesso && (
            <div className="rounded-lg border border-green-500/40 bg-green-950/30 p-3 text-green-400 text-sm">
              {sucesso}
            </div>
          )}
          {erro && (
            <div className="rounded-lg border border-red-500/40 bg-red-950/30 p-3 text-red-400 text-sm">
              {erro}
            </div>
          )}

          {/* Perfil pós-login */}
          {perfil && (
            <div className="rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-4 space-y-1">
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">Perfil</p>
              <p className="font-bold">{perfil.nome}</p>
              <p className="text-sm text-gray-400">@{perfil.username}</p>
              <p className="text-sm text-gray-400">{perfil.email}</p>
            </div>
          )}

          {/* Formulário de Login */}
          {aba === 'login' && !perfil && (
            <div className="space-y-4">
              <Input label="Username" value={username} onChange={setUsername} placeholder="seu_usuario" />
              <Input label="Senha" type="password" value={senha} onChange={setSenha} placeholder="••••••••" />
              <Botao onClick={handleLogin} carregando={carregando} label="Entrar" />
            </div>
          )}

          {/* Formulário de Cadastro */}
          {aba === 'cadastro' && (
            <div className="space-y-4">
              <Input label="Nome completo" value={nome} onChange={setNome} placeholder="Seu Nome" />
              <Input label="Username" value={username} onChange={setUsername} placeholder="seu_usuario" />
              <Input label="E-mail" type="email" value={email} onChange={setEmail} placeholder="voce@email.com" />
              <Input label="Senha" type="password" value={senha} onChange={setSenha} placeholder="••••••••" />
              <Botao onClick={handleCadastro} carregando={carregando} label="Criar conta" />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}