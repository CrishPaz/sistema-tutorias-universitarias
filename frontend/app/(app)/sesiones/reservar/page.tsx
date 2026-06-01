'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Calendar } from 'lucide-react'

interface Tutor {
  id: string
  usuario: {
    nombreCompleto: string
  }
  especialidad: string
  tarifaHora: number
  calificacionPromedio: number
}

interface Materia {
  id: string
  nombre: string
  codigo: string
}

export default function ReservarSesion() {
  const router = useRouter()
  const [tutores, setTutores] = useState<Tutor[]>([])
  const [materias, setMaterias] = useState<Materia[]>([])
  const [selectedTutor, setSelectedTutor] = useState('')
  const [selectedMateria, setSelectedMateria] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [duracion, setDuracion] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Cargar tutores y materias
  useEffect(() => {
    api.get('/materias').then(res => setMaterias(res.data))
    api.get('/tutores').then(res => setTutores(res.data))
  }, [])

  const handleReservar = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const estudianteId = localStorage.getItem('userId')

    if (!estudianteId) {
      setError('Debes iniciar sesión')
      setLoading(false)
      return
    }

    try {
      const fechaInicio = `${fecha}T${hora}:00`

      // El endpoint usa query params (@RequestParam), no body.
      await api.post('/sesiones/reservar', null, {
        params: {
          estudianteId,
          tutorId: selectedTutor,
          materiaId: selectedMateria,
          fechaInicio,
          duracion,
          modalidad: 'VIRTUAL',
          notas: 'Reserva desde la plataforma web'
        }
      })

      alert('¡Sesión reservada exitosamente!')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reservar la sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="glass p-10 rounded-3xl border border-white/10">
          <div className="text-center mb-10">
            <div className="mx-auto w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Reservar Sesión de Tutoría</h1>
            <p className="text-zinc-400 mt-2">Elige tutor, materia, fecha y hora</p>
          </div>

          <form onSubmit={handleReservar} className="space-y-8">
            {/* Materia */}
            <div>
              <label className="block text-sm font-medium mb-3 text-zinc-300">Materia</label>
              <select 
                value={selectedMateria} 
                onChange={(e) => setSelectedMateria(e.target.value)}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
                required
              >
                <option value="">Selecciona una materia</option>
                {materias.map(m => (
                  <option key={m.id} value={m.id}>{m.codigo} - {m.nombre}</option>
                ))}
              </select>
            </div>

            {/* Tutor */}
            <div>
              <label className="block text-sm font-medium mb-3 text-zinc-300">Tutor</label>
              <select 
                value={selectedTutor} 
                onChange={(e) => setSelectedTutor(e.target.value)}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
                required
              >
                <option value="">Selecciona un tutor</option>
                {tutores.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.usuario.nombreCompleto} - {t.especialidad} (S/ {t.tarifaHora}/hora)
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3 text-zinc-300">Fecha</label>
                <input 
                  type="date" 
                  value={fecha} 
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-3 text-zinc-300">Hora</label>
                <input 
                  type="time" 
                  value={hora} 
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
                  required 
                />
              </div>
            </div>

            {/* Duración */}
            <div>
              <label className="block text-sm font-medium mb-3 text-zinc-300">Duración</label>
              <select 
                value={duracion} 
                onChange={(e) => setDuracion(parseInt(e.target.value))}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>1 hora</option>
                <option value={90}>1 hora y 30 minutos</option>
                <option value={120}>2 horas</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-2xl">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-black font-semibold rounded-2xl text-lg flex items-center justify-center gap-3 transition-all"
            >
              {loading ? 'Reservando...' : 'Confirmar Reserva'}
              <Calendar className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}