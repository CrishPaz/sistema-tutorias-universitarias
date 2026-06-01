'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { BarChart3, Users, GraduationCap, Calendar, DollarSign, Star } from 'lucide-react'

interface Resumen {
  totalUsuarios: number
  totalTutores: number
  totalSesiones: number
  ingresosTotales: number
  sesionesPorEstado: Record<string, number>
  rankingTutores: { nombre: string; especialidad: string; totalSesiones: number; calificacionPromedio: number }[]
}

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: 'bg-yellow-500',
  CONFIRMADA: 'bg-blue-500',
  EN_PROGRESO: 'bg-purple-500',
  COMPLETADA: 'bg-emerald-500',
  CANCELADA: 'bg-red-500',
  NO_ASISTIO: 'bg-zinc-500',
}

export default function AdminReportes() {
  const router = useRouter()
  const [r, setR] = useState<Resumen | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const rol = localStorage.getItem('rol')
    if (rol && rol !== 'ADMIN' && rol !== 'COORDINADOR') {
      router.replace('/dashboard')
      return
    }
    api.get('/admin/reportes/resumen')
      .then(res => setR(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Cargando...</div>
  if (!r) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Sin datos</div>

  const maxEstado = Math.max(1, ...Object.values(r.sesionesPorEstado))

  const cards = [
    { label: 'Usuarios', value: r.totalUsuarios, icon: Users, color: 'text-purple-400' },
    { label: 'Tutores', value: r.totalTutores, icon: GraduationCap, color: 'text-emerald-400' },
    { label: 'Sesiones', value: r.totalSesiones, icon: Calendar, color: 'text-blue-400' },
    { label: 'Ingresos', value: `S/ ${Number(r.ingresosTotales).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-yellow-400' },
  ]

  return (
    <div className="min-h-screen bg-zinc-950 px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-semibold tracking-tight flex items-center gap-3 mb-2">
          <BarChart3 className="w-10 h-10 text-purple-400" /> Reportes
        </h1>
        <p className="text-zinc-400 mb-10">Métricas agregadas de la plataforma</p>

        {/* Tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {cards.map((c, i) => (
            <div key={i} className="glass p-8 rounded-3xl border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl font-semibold tracking-tighter">{c.value}</div>
                  <div className="text-sm text-zinc-400 mt-1">{c.label}</div>
                </div>
                <c.icon className={`w-9 h-9 ${c.color}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sesiones por estado */}
          <div className="glass p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">Sesiones por estado</h2>
            <div className="space-y-4">
              {Object.entries(r.sesionesPorEstado).map(([estado, n]) => (
                <div key={estado}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-300">{estado}</span>
                    <span className="text-zinc-400">{n}</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${ESTADO_COLOR[estado] || 'bg-zinc-500'}`}
                      style={{ width: `${(n / maxEstado) * 100}%` }} />
                  </div>
                </div>
              ))}
              {Object.keys(r.sesionesPorEstado).length === 0 && (
                <p className="text-zinc-500 text-sm">Sin sesiones registradas.</p>
              )}
            </div>
          </div>

          {/* Ranking de tutores */}
          <div className="glass p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-semibold mb-6">Top tutores</h2>
            <div className="space-y-3">
              {r.rankingTutores.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-sm font-semibold">{i + 1}</span>
                    <div>
                      <div className="font-medium">{t.nombre}</div>
                      <div className="text-xs text-zinc-400">{t.especialidad}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium flex items-center gap-1 justify-end">
                      <Star className="w-3.5 h-3.5 text-yellow-400" /> {t.calificacionPromedio}
                    </div>
                    <div className="text-xs text-zinc-400">{t.totalSesiones} sesiones</div>
                  </div>
                </div>
              ))}
              {r.rankingTutores.length === 0 && <p className="text-zinc-500 text-sm">Sin tutores.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
