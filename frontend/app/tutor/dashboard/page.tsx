'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Calendar, DollarSign, Users, Star, LogOut, User, Clock } from 'lucide-react'
import Link from 'next/link'

export default function TutorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sesiones, setSesiones] = useState<any[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const rol = localStorage.getItem('rol')

    if (!token || rol !== 'TUTOR') {
      router.push('/auth/login')
      return
    }

    setUser({ nombre, rol })

    const userId = localStorage.getItem('userId')
    if (userId) {
      axios.get(`http://localhost:8080/api/sesiones/tutor/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setSesiones(res.data))
      .catch(console.error)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-2xl flex items-center justify-center">
              <span className="font-bold">TU</span>
            </div>
            <span className="font-semibold text-2xl">Tutorias <span className="text-emerald-400 text-sm">Tutor</span></span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-medium">{user?.nombre}</div>
              <div className="text-xs text-emerald-400">Tutor Verificado</div>
            </div>
            <button onClick={handleLogout} className="p-3 hover:bg-white/10 rounded-2xl">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">Panel de Tutor</h1>
            <p className="text-xl text-zinc-400">Gestiona tus sesiones y disponibilidad</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/tutor/perfil" 
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-sm font-medium transition-all"
            >
              <User className="w-4 h-4" /> Mi Perfil
            </Link>
            <Link 
              href="/tutor/disponibilidad" 
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600/30 hover:bg-emerald-600/50 rounded-2xl text-sm font-medium transition-all"
            >
              <Clock className="w-4 h-4" /> Disponibilidad
            </Link>
          </div>
        </div>

        {/* Stats Tutor */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">47</div>
                <div className="text-sm text-zinc-400 mt-1">Sesiones este mes</div>
              </div>
              <Calendar className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">S/ 1,890</div>
                <div className="text-sm text-zinc-400 mt-1">Ingresos este mes</div>
              </div>
              <DollarSign className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">4.92</div>
                <div className="text-sm text-zinc-400 mt-1">Calificación promedio</div>
              </div>
              <Star className="w-9 h-9 text-yellow-400" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">312</div>
                <div className="text-sm text-zinc-400 mt-1">Estudiantes atendidos</div>
              </div>
              <Users className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Próximas sesiones programadas</h2>
          <Link href="/tutor/disponibilidad" className="text-emerald-400 hover:underline">Gestionar disponibilidad →</Link>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10">
          {sesiones.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto w-16 h-16 text-zinc-700 mb-4" />
              <p className="text-zinc-400">No tienes sesiones programadas por el momento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sesiones.map((sesion, i) => (
                <div key={i} className="flex justify-between items-center p-6 bg-zinc-900/50 rounded-2xl">
                  <div>
                    <div className="font-semibold">{sesion.materia?.nombre}</div>
                    <div className="text-sm text-zinc-400">Estudiante: {sesion.estudiante?.usuario?.nombreCompleto}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{new Date(sesion.fechaHoraInicio).toLocaleString('es-MX')}</div>
                    <div className="text-xs text-emerald-400">{sesion.estado}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}