import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/lib/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tutorias Universitarias | Plataforma Premium',
  description: 'Sistema Inteligente de Gestión de Tutorías y Asesorías Universitarias',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}