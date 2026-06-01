'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Save, Clock } from 'lucide-react'

export default function DisponibilidadTutor() {
  const [disponibilidad, setDisponibilidad] = useState<any>({
    lunes: { inicio: '08:00', fin: '18:00' },
    martes: { inicio: '08:00', fin: '18:00' },
    miercoles: { inicio: '08:00', fin: '18:00' },
    jueves: { inicio: '08:00', fin: '18:00' },
    viernes: { inicio: '08:00', fin: '18:00' },
    sabado: { inicio: '09:00', fin: '14:00' },
    domingo: { inicio: '', fin: '' }
  })
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    cargarDisponibilidad()
  }, [userId])

  const cargarDisponibilidad = async () => {
    try {
      const res = await api.get(`/tutores/perfil/${userId}`)
      // El backend devuelve una lista [{diaSemana, horaInicio, horaFin}]; la convertimos al objeto por día
      const lista = res.data.disponibilidades || []
      if (lista.length > 0) {
        const obj: any = {}
        lista.forEach((d: any) => {
          obj[d.diaSemana.toLowerCase()] = {
            inicio: (d.horaInicio || '').slice(0, 5),
            fin: (d.horaFin || '').slice(0, 5)
          }
        })
        setDisponibilidad((prev: any) => ({ ...prev, ...obj }))
      }
    } catch (error) {
      console.error('Error cargando disponibilidad')
    }
  }

  const guardarDisponibilidad = async () => {
    setSaving(true)
    try {
      // Convertimos el objeto por día a la lista que espera el backend (solo días con horas)
      const disponibilidades = Object.entries(disponibilidad)
        .filter(([, h]: any) => h?.inicio && h?.fin)
        .map(([dia, h]: any) => ({
          diaSemana: dia.toUpperCase(),
          horaInicio: h.inicio,
          horaFin: h.fin
        }))

      await api.put(`/tutores/disponibilidad/${userId}`, { disponibilidades })
      setMensaje('Disponibilidad guardada correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (error) {
      setMensaje('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const dias = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <h1 className="text-4xl font-semibold tracking-tight flex items-center gap-3">
            <Clock className="w-9 h-9" /> Mi Disponibilidad
          </h1>
        </div>

        {mensaje && (
          <div className="bg-emerald-950/50 border border-emerald-500 text-emerald-400 p-4 rounded-2xl mb-6">
            {mensaje}
          </div>
        )}

        <div className="glass p-10 rounded-3xl border border-white/10">
          <p className="text-zinc-400 mb-8">
            Configura tus horarios de disponibilidad. Los estudiantes solo podrán reservar en estos horarios.
          </p>

          <div className="space-y-6">
            {dias.map(dia => (
              <div key={dia.key} className="flex items-center gap-6">
                <div className="w-32 font-medium">{dia.label}</div>
                
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1">
                    <label className="text-xs text-zinc-500 block mb-1">Desde</label>
                    <input 
                      type="time" 
                      value={disponibilidad[dia.key]?.inicio || ''} 
                      onChange={(e) => setDisponibilidad({
                        ...disponibilidad, 
                        [dia.key]: { ...disponibilidad[dia.key], inicio: e.target.value }
                      })}
                      className="w-full bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="text-xs text-zinc-500 block mb-1">Hasta</label>
                    <input 
                      type="time" 
                      value={disponibilidad[dia.key]?.fin || ''} 
                      onChange={(e) => setDisponibilidad({
                        ...disponibilidad, 
                        [dia.key]: { ...disponibilidad[dia.key], fin: e.target.value }
                      })}
                      className="w-full bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={guardarDisponibilidad}
            disabled={saving}
            className="w-full mt-10 py-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-black font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Disponibilidad'}
          </button>
        </div>
      </div>
    </div>
  )
}