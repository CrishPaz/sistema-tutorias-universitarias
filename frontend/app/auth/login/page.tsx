'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import axios from 'axios'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      })

      const { accessToken, userId, rol, nombreCompleto } = response.data

      // Guardar en localStorage
      localStorage.setItem('token', accessToken)
      localStorage.setItem('userId', userId)
      localStorage.setItem('rol', rol)
      localStorage.setItem('nombre', nombreCompleto)

      // Redirigir según rol
      if (rol === 'TUTOR') {
        router.push('/tutor/dashboard')
      } else if (rol === 'ADMIN' || rol === 'COORDINADOR') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        <div className="glass p-10 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <span className="text-3xl font-bold">TU</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Bienvenido de nuevo</h1>
            <p className="text-zinc-400 mt-2">Inicia sesión en tu cuenta de Tutorias</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-purple-500 text-white placeholder:text-zinc-500"
                placeholder="tu@universidad.edu"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3.5 pr-12 focus:outline-none focus:border-purple-500 text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-950/50 border border-red-900 p-3 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-black font-semibold rounded-2xl mt-2 transition-all flex items-center justify-center"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-400">
            ¿No tienes cuenta?{' '}
            <Link href="/auth/register" className="text-purple-400 hover:underline font-medium">
              Regístrate gratis
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Al iniciar sesión aceptas nuestros Términos y Política de Privacidad
        </p>
      </div>
    </div>
  )
}