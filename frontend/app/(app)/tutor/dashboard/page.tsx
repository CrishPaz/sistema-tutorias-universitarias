'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Calendar, DollarSign, Users, Star, User, Clock } from 'lucide-react'
import Link from 'next/link'

export default function TutorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sesiones, setSesiones] = useState<any[]>([])
  const [perfil, setPerfil] = useState<any>(null)

  useEffect(() => {
    const nombre = localStorage.getItem('nombre')
    const rol = localStorage.getItem('rol')

    if (rol && rol !== 'TUTOR') {
      router.replace(rol === 'ESTUDIANTE' ? '/dashboard' : '/admin/dashboard')
      return
    }

    setUser({ nombre, rol })

    const userId = localStorage.getItem('userId')
    if (userId) {
      api.get(`/sesiones/tutor/${userId}`)
        .then(res => setSesiones(res.data))
        .catch(console.error)
      api.get(`/tutores/perfil/${userId}`)
        .then(res => setPerfil(res.data))
        .catch(console.error)
    }
  }, [router])

  // Métricas reales derivadas de las sesiones / perfil
  const completadas = sesiones.filter(s => s.estado === 'COMPLETADA')
  const ingresos = completadas.reduce((acc, s) => acc + (Number(s.precio) || 0), 0)
  const estudiantesUnicos = new Set(sesiones.map(s => s.estudiante?.id).filter(Boolean)).size
  const calificacion = perfil?.calificacionPromedio ?? '—'
  const totalSesiones = perfil?.totalSesiones ?? completadas.length

  return (
    <div className="min-h-screen bg-zinc-950">

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
                <div className="text-4xl font-semibold">{totalSesiones}</div>
                <div className="text-sm text-zinc-400 mt-1">Sesiones completadas</div>
              </div>
              <Calendar className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">S/ {ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className="text-sm text-zinc-400 mt-1">Ingresos (sesiones completadas)</div>
              </div>
              <DollarSign className="w-9 h-9 text-emerald-400" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">{calificacion}</div>
                <div className="text-sm text-zinc-400 mt-1">Calificación promedio</div>
              </div>
              <Star className="w-9 h-9 text-yellow-400" />
            </div>
          </div>
          <div className="glass p-8 rounded-3xl">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-4xl font-semibold">{estudiantesUnicos}</div>
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