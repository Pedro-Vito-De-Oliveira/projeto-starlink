// app/auth/page.js
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'

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

export default function AuthPage() {
  const router = useRouter()
  const [aba, setAba] = useState('login')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [perfil, setPerfil] = useState(null)

  const [nome, setNome] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  function limparEstado() {
    setErro(null)
    setSucesso(null)
    setPerfil(null)
  }

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
      localStorage.setItem('usuario_starlink', JSON.stringify(data.perfil))
      setSucesso(`Bem-vindo(a), ${data.perfil.nome}! Redirecionando...`)

      setTimeout(() => { router.push('/') }, 1500)
    } catch {
      setErro('Erro de rede. Verifique se o backend Flask está rodando.')
    } finally {
      setCarregando(false)
    }
  }

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
      setSucesso('Cadastro realizado! Faca login para continuar.')
      setAba('login')
    } catch {
      setErro('Erro de rede. Verifique se o backend Flask esta rodando.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

      
        {/* Titulo */}
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

          {perfil && (
            <div className="rounded-lg border border-cyan-700/40 bg-cyan-950/20 p-4 space-y-1">
              <p className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">Perfil</p>
              <p className="font-bold">{perfil.nome}</p>
              <p className="text-sm text-gray-400">@{perfil.username}</p>
              <p className="text-sm text-gray-400">{perfil.email}</p>
            </div>
          )}

          {aba === 'login' && !perfil && (
            <div className="space-y-4">
              <Input label="Username" value={username} onChange={setUsername} placeholder="seu_usuario" />
              <Input label="Senha" type="password" value={senha} onChange={setSenha} placeholder="••••••••" />
              <Botao onClick={handleLogin} carregando={carregando} label="Entrar" />
            </div>
          )}

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