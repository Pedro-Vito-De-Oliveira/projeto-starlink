// app/layout.js
// Layout raiz — envolve TODAS as páginas do projeto.
// É aqui que entram as fontes, o <html>, o <body> e o Tailwind.

import './globals.css'

export const metadata = {
  title: 'Starlink Dashboard',
  description: 'Gerencie conectividade, resolva problemas e encontre o plano ideal.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
