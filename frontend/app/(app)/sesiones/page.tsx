'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'
import Link from 'next/link'
import { Calendar, Star, GraduationCap } from 'lucide-react'

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE: 'bg-yellow-500/20 text-yellow-400',
  CONFIRMADA: 'bg-blue-500/20 text-blue-400',
  EN_PROGRESO: 'bg-purple-500/20 text-purple-300',
  COMPLETADA: 'bg-emerald-500/20 text-emerald-400',
  CANCELADA: 'bg-red-500/20 text-red-400',
  NO_ASISTIO: 'bg-zinc-500/20 text-zinc-300',
}

function Estrellas({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-4 h-4 ${i <= n ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
      ))}
    </span>
  )
}

export default function MisSesiones() {
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    const rol = localStorage.getItem('rol')
    if (!userId) return

    const endpoint = rol === 'TUTOR'
      ? `/sesiones/tutor/${userId}`
      : `/sesiones/estudiante/${userId}`

    api.get(endpoint)
      .then(res => setSesiones(res.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-5xl font-semibold tracking-tight">Mis Sesiones</h1>
          <Link href="/sesiones/reservar" className="px-8 py-3 bg-white text-black rounded-2xl font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Nueva Reserva
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Cargando...</div>
        ) : sesiones.length === 0 ? (
          <div className="text-center py-20 glass rounded-3xl">
            <p className="text-xl text-zinc-400">No tienes sesiones aún</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sesiones.map((s, i) => {
              const tieneResena = s.calificacionEstudiante != null || (s.resenaEstudiante && s.resenaEstudiante.trim())
              const tieneNota = s.notaAcademica != null || (s.resenaTutor && s.resenaTutor.trim())
              return (
                <div key={i} className="glass p-8 rounded-3xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-2xl">{s.materia?.nombre}</div>
                      <div className="text-zinc-400">con {s.tutor?.usuario?.nombreCompleto || s.estudiante?.usuario?.nombreCompleto}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg">{new Date(s.fechaHoraInicio).toLocaleString('es-PE')}</div>
                      <div className={`inline-block px-4 py-1 text-xs rounded-full mt-2 font-semibold ${ESTADO_STYLE[s.estado] || 'bg-zinc-700'}`}>
                        {s.estado}
                      </div>
                    </div>
                  </div>

                  {(tieneResena || tieneNota) && (
                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Valoración del estudiante al servicio */}
                      {tieneResena && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                            <Star className="w-4 h-4 text-yellow-400" /> Valoración del estudiante
                          </div>
                          {s.calificacionEstudiante != null && <Estrellas n={s.calificacionEstudiante} />}
                          {s.resenaEstudiante && <p className="text-zinc-300 mt-2 text-sm italic">“{s.resenaEstudiante}”</p>}
                        </div>
                      )}
                      {/* Nota académica del tutor al estudiante */}
                      {tieneNota && (
                        <div>
                          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                            <GraduationCap className="w-4 h-4 text-emerald-400" /> Nota académica del tutor
                          </div>
                          {s.notaAcademica != null && (
                            <div className="text-2xl font-semibold">{s.notaAcademica}<span className="text-sm text-zinc-500"> / 20</span></div>
                          )}
                          {s.resenaTutor && <p className="text-zinc-300 mt-2 text-sm italic">“{s.resenaTutor}”</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
