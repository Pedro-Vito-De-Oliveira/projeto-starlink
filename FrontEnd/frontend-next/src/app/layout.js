// app/layout.js
import './globals.css'

export const metadata = {
  title: 'Starlink Dashboard',
  description: 'Gerencie conectividade, resolva problemas e encontre o plano ideal.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}