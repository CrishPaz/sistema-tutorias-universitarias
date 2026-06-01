'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { Users, BookOpen, Star, ShieldCheck, LogOut, GraduationCap } from 'lucide-react'

interface Tutor {
  id: string
  especialidad: string
  tarifaHora: number
  calificacionPromedio: number
  totalSesiones: number
  verificado: boolean
  usuario?: { nombreCompleto: string; email: string }
}

interface Materia {
  id: string
  codigo: string
  nombre: string
  departamento: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tutores, setTutores] = useState<Tutor[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const rol = localStorage.getItem('rol')

    if (!token || (rol !== 'ADMIN' && rol !== 'COORDINADOR')) {
      router.push('/auth/login')
      return
    }

    setUser({ nombre, rol })

    const headers = { Authorization: `Bearer ${token}` }
    Promise.all([
      axios.get('http://localhost:8080/api/tutores', { headers }).then(r => setTutores(r.data)).catch(console.error),
      axios.get('http://localhost:8080/api/materias', { headers }).then(r => setMaterias(r.data)).catch(console.error),
    ]).finally(() => setLoading(false))
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/auth/login')
  }

  const tutoresVerificados = tutores.filter(t => t.verificado).length
  const calificacionMedia = tutores.length
    ? (tutores.reduce((acc, t) => acc + (t.calificacionPromedio || 0), 0) / tutores.length).toFixed(2)
    : '—'

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-2xl flex items-center justify-center">
              <span className="font-bold">TU</span>
            </div>
            <span className="font-semibold text-2xl">
              Tutorias <span className="text-purple-400 text-sm">{user?.rol === 'COORDINADOR' ? 'Coordinador' : 'Admin'}</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-medium">{user?.nombre}</div>
              <div className="text-xs text-purple-400">{user?.rol === 'COORDINADOR' ? 'Coordinador Académico' : 'Administrador'}</div>
            </div>
            <button onClick={handleLogout} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-5xl font-semibold tracking-tight">Panel de Administración</h1>
          <p className="text-xl text-zinc-400 mt-2">Resumen general de la plataforma</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Tutores registrados", value: loading ? '…' : tutores.length, icon: Users, color: "text-purple-400" },
            { label: "Tutores verificados", value: loading ? '…' : tutoresVerificados, icon: ShieldCheck, color: "text-emerald-400" },
            { label: "Materias activas", value: loading ? '…' : materias.length, icon: BookOpen, color: "text-blue-400" },
            { label: "Calificación media", value: loading ? '…' : calificacionMedia, icon: Star, color: "text-yellow-400" },
          ].map((stat, i) => (
            <div key={i} className="glass p-8 rounded-3xl border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-4xl font-semibold tracking-tighter">{stat.value}</div>
                  <div className="text-sm text-zinc-400 mt-1">{stat.label}</div>
                </div>
                <stat.icon className={`w-9 h-9 ${stat.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tutores */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-semibold">Tutores de la plataforma</h2>
        </div>

        {loading ? (
          <div className="text-center py-12 text-zinc-400">Cargando datos...</div>
        ) : tutores.length === 0 ? (
          <div className="glass p-16 rounded-3xl text-center border border-white/10">
            <GraduationCap className="mx-auto w-16 h-16 text-zinc-700 mb-6" />
            <h3 className="text-2xl font-semibold mb-2">Sin tutores registrados</h3>
            <p className="text-zinc-400">Aún no hay tutores en el sistema.</p>
          </div>
        ) : (
          <div className="grid gap-4 mb-12">
            {tutores.map((tutor, i) => (
              <div key={i} className="glass p-8 rounded-3xl border border-white/10 flex items-center justify-between card-hover">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-xl flex items-center gap-2">
                      {tutor.usuario?.nombreCompleto || 'Tutor'}
                      {tutor.verificado && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-zinc-400">{tutor.especialidad}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right">
                  <div>
                    <div className="text-sm text-zinc-400">Tarifa</div>
                    <div className="font-medium">S/ {tutor.tarifaHora}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Sesiones</div>
                    <div className="font-medium">{tutor.totalSesiones ?? 0}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">{tutor.calificacionPromedio ?? '—'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Materias */}
        {!loading && materias.length > 0 && (
          <>
            <h2 className="text-3xl font-semibold mb-8">Materias registradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materias.map((m, i) => (
                <div key={i} className="glass p-6 rounded-3xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <span className="text-xs text-zinc-500 font-mono">{m.codigo}</span>
                  </div>
                  <div className="font-semibold text-lg">{m.nombre}</div>
                  <div className="text-sm text-zinc-400">{m.departamento}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
