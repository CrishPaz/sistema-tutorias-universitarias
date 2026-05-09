'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Calendar, Clock, Star, Users, LogOut } from 'lucide-react'
import Link from 'next/link'

interface Sesion {
  id: string
  fechaHoraInicio: string
  estado: string
  tutor: { usuario: { nombreCompleto: string } }
  materia: { nombre: string }
  precio: number
}

export default function StudentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const rol = localStorage.getItem('rol')

    if (!token || rol !== 'ESTUDIANTE') {
      router.push('/auth/login')
      return
    }

    setUser({ nombre, rol })

    // Cargar sesiones del estudiante
    const userId = localStorage.getItem('userId')
    if (userId) {
      axios.get(`http://localhost:8080/api/sesiones/estudiante/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setSesiones(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/auth/login')
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'status-pendiente'
      case 'CONFIRMADA': return 'status-confirmada'
      case 'COMPLETADA': return 'status-completada'
      case 'CANCELADA': return 'status-cancelada'
      default: return 'bg-zinc-700'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navbar */}
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-2xl flex items-center justify-center">
              <span className="font-bold">TU</span>
            </div>
            <span className="font-semibold text-2xl">Tutorias</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-medium">{user?.nombre}</div>
              <div className="text-xs text-emerald-400">Estudiante</div>
            </div>
            <button onClick={handleLogout} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight">Hola, {user?.nombre?.split(' ')[0]} 👋</h1>
            <p className="text-xl text-zinc-400 mt-2">¿Qué quieres hacer hoy?</p>
          </div>
          
          <Link 
            href="/sesiones/reservar" 
            className="flex items-center gap-3 px-8 py-4 bg-white text-black rounded-3xl font-semibold hover:bg-zinc-100 transition-all"
          >
            <Calendar className="w-5 h-5" /> Reservar nueva sesión
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Sesiones este mes", value: sesiones.length, icon: Calendar, color: "text-purple-400" },
            { label: "Horas de tutoría", value: "18", icon: Clock, color: "text-blue-400" },
            { label: "Promedio actual", value: "8.7", icon: Star, color: "text-yellow-400" },
            { label: "Tutores favoritos", value: "4", icon: Users, color: "text-emerald-400" }
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-3xl border border-white/10">
              <div className="flex justify-between">
                <div>
                  <div className="text-4xl font-semibold tracking-tighter">{stat.value}</div>
                  <div className="text-sm text-zinc-400 mt-1">{stat.label}</div>
                </div>
                <stat.icon className={`w-9 h-9 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Próximas Sesiones */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Próximas sesiones</h2>
          <Link href="/sesiones" className="text-purple-400 hover:underline text-sm">Ver todas →</Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-400">Cargando sesiones...</div>
        ) : sesiones.length === 0 ? (
          <div className="glass p-16 rounded-3xl text-center border border-white/10">
            <Calendar className="mx-auto w-16 h-16 text-zinc-700 mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No tienes sesiones programadas</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">Reserva tu primera tutoría con los mejores tutores de la universidad</p>
            <Link href="/sesiones/reservar" className="inline-flex px-8 py-3 bg-purple-600 rounded-2xl font-medium">Reservar ahora</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {sesiones.slice(0, 4).map((sesion, index) => (
              <div key={index} className="glass p-8 rounded-3xl border border-white/10 flex items-center justify-between card-hover">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-xl">{sesion.materia?.nombre || 'Materia'}</div>
                    <div className="text-zinc-400">con {sesion.tutor?.usuario?.nombreCompleto || 'Tutor'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div>
                    <div className="text-sm text-zinc-400">Fecha</div>
                    <div className="font-medium">{new Date(sesion.fechaHoraInicio).toLocaleDateString('es-MX')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Hora</div>
                    <div className="font-medium">{new Date(sesion.fechaHoraInicio).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                  <div className={`px-5 py-1.5 rounded-2xl text-xs font-semibold border ${getStatusColor(sesion.estado)}`}>
                    {sesion.estado}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}