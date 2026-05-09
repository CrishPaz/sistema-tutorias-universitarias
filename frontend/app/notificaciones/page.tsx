'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Bell, Check } from 'lucide-react'
import Link from 'next/link'

interface Notificacion {
  id: string
  titulo: string
  mensaje: string
  tipo: string
  leida: boolean
  created_at: string
}

export default function NotificacionesPage() {
  const router = useRouter()
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    if (!token || !userId) {
      router.push('/auth/login')
      return
    }

    cargarNotificaciones()
  }, [router, token, userId])

  const cargarNotificaciones = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/notificaciones/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotificaciones(res.data)
    } catch (error) {
      console.error('Error cargando notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLeida = async (id: string) => {
    try {
      await axios.patch(`http://localhost:8080/api/notificaciones/${id}/leer`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      cargarNotificaciones()
    } catch (error) {
      console.error('Error marcando notificación')
    }
  }

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'SESION': return '📅'
      case 'PAGO': return '💰'
      case 'RECORDATORIO': return '⏰'
      case 'CALIFICACION': return '⭐'
      default: return '🔔'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Cargando notificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-semibold tracking-tight flex items-center gap-3">
                <Bell className="w-9 h-9" /> Notificaciones
              </h1>
              <p className="text-zinc-400">Mantente al día con tus actividades</p>
            </div>
          </div>
          
          <div className="text-sm text-zinc-400">
            {notificaciones.filter(n => !n.leida).length} sin leer
          </div>
        </div>

        {notificaciones.length === 0 ? (
          <div className="glass p-16 rounded-3xl text-center border border-white/10">
            <Bell className="mx-auto w-16 h-16 text-zinc-700 mb-6" />
            <h3 className="text-2xl font-semibold mb-2">No tienes notificaciones</h3>
            <p className="text-zinc-400">Cuando tengas actividad, aparecerán aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificaciones.map((notif) => (
              <div 
                key={notif.id} 
                className={`glass p-6 rounded-3xl border transition-all ${!notif.leida ? 'border-purple-500/50' : 'border-white/10'}`}
              >
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0 mt-1">
                    {getIconoTipo(notif.tipo)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{notif.titulo}</h3>
                        <p className="text-zinc-300 mt-1 leading-relaxed">{notif.mensaje}</p>
                      </div>
                      
                      {!notif.leida && (
                        <button 
                          onClick={() => marcarComoLeida(notif.id)}
                          className="flex items-center gap-1 text-xs bg-purple-600/30 hover:bg-purple-600/50 px-3 py-1 rounded-full transition-all"
                        >
                          <Check className="w-3 h-3" /> Marcar leída
                        </button>
                      )}
                    </div>
                    
                    <div className="text-xs text-zinc-500 mt-3">
                      {new Date(notif.created_at).toLocaleString('es-PE')}
                    </div>
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