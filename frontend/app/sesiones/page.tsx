'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { ArrowLeft, Calendar } from 'lucide-react'

export default function MisSesiones() {
  const [sesiones, setSesiones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const rol = localStorage.getItem('rol')

    if (!token || !userId) return

    const endpoint = rol === 'TUTOR' 
      ? `http://localhost:8080/api/sesiones/tutor/${userId}`
      : `http://localhost:8080/api/sesiones/estudiante/${userId}`

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSesiones(res.data))
    .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-purple-400 mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver al dashboard
        </Link>

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
            {sesiones.map((s, i) => (
              <div key={i} className="glass p-8 rounded-3xl flex justify-between items-center">
                <div>
                  <div className="font-semibold text-2xl">{s.materia?.nombre}</div>
                  <div className="text-zinc-400">con {s.tutor?.usuario?.nombreCompleto || s.estudiante?.usuario?.nombreCompleto}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg">{new Date(s.fechaHoraInicio).toLocaleString('es-MX')}</div>
                  <div className={`inline-block px-4 py-1 text-xs rounded-full mt-2 ${s.estado === 'COMPLETADA' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {s.estado}
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