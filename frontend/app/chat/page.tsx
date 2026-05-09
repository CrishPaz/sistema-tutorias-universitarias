'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Send, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Mensaje {
  id: string
  contenido: string
  remitente_id: string
  created_at: string
}

interface Sesion {
  id: string
  materia: { nombre: string }
  tutor?: { usuario: { nombreCompleto: string } }
  estudiante?: { usuario: { nombreCompleto: string } }
}

export default function ChatPage() {
  const router = useRouter()
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [selectedSesion, setSelectedSesion] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Cargar sesiones activas
  useEffect(() => {
    if (!token) {
      router.push('/auth/login')
      return
    }

    const rol = localStorage.getItem('rol')
    const endpoint = rol === 'TUTOR' 
      ? `http://localhost:8080/api/sesiones/tutor/${userId}`
      : `http://localhost:8080/api/sesiones/estudiante/${userId}`

    axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setSesiones(res.data.filter((s: any) => s.estado === 'CONFIRMADA' || s.estado === 'EN_PROGRESO'))
    })
  }, [router, userId, token])

  // Cargar mensajes cuando se selecciona una sesión
  useEffect(() => {
    if (!selectedSesion || !token) return

    const interval = setInterval(() => {
      axios.get(`http://localhost:8080/api/mensajes/${selectedSesion}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setMensajes(res.data))
    }, 3000) // Actualizar cada 3 segundos

    return () => clearInterval(interval)
  }, [selectedSesion, token])

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !selectedSesion || !userId) return

    setLoading(true)
    try {
      await axios.post('http://localhost:8080/api/mensajes', {
        sesion_id: selectedSesion,
        remitente_id: userId,
        contenido: nuevoMensaje
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setNuevoMensaje('')
      // Recargar mensajes
      const res = await axios.get(`http://localhost:8080/api/mensajes/${selectedSesion}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMensajes(res.data)
    } catch (error) {
      alert('Error al enviar mensaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="glass border-b border-white/10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold">Chat de Sesiones</h1>
              <p className="text-sm text-zinc-400">Comunícate con tu tutor o estudiante</p>
            </div>
          </div>
          <MessageCircle className="w-8 h-8 text-purple-400" />
        </div>
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        {/* Lista de Sesiones */}
        <div className="w-80 border-r border-white/10 p-6">
          <h3 className="font-semibold mb-4 text-zinc-300">Tus Sesiones Activas</h3>
          
          {sesiones.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <MessageCircle className="mx-auto w-12 h-12 mb-3 opacity-50" />
              <p>No tienes sesiones activas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sesiones.map(sesion => (
                <button
                  key={sesion.id}
                  onClick={() => setSelectedSesion(sesion.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all ${
                    selectedSesion === sesion.id 
                      ? 'bg-purple-600/30 border border-purple-500' 
                      : 'bg-zinc-900 hover:bg-zinc-800 border border-white/10'
                  }`}
                >
                  <div className="font-medium">{sesion.materia.nombre}</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    {sesion.tutor?.usuario.nombreCompleto || sesion.estudiante?.usuario.nombreCompleto}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Área de Chat */}
        <div className="flex-1 flex flex-col">
          {!selectedSesion ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="mx-auto w-16 h-16 text-zinc-700 mb-4" />
                <h3 className="text-xl font-semibold text-zinc-400">Selecciona una sesión</h3>
                <p className="text-zinc-500 mt-2">Elige una sesión activa para comenzar a chatear</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header del Chat */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-semibold">Chat de Sesión</div>
                  <div className="text-sm text-emerald-400">En línea</div>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-950">
                {mensajes.length === 0 ? (
                  <div className="text-center text-zinc-400 py-12">
                    Aún no hay mensajes. ¡Sé el primero en escribir!
                  </div>
                ) : (
                  mensajes.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.remitente_id === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] p-4 rounded-3xl ${
                        msg.remitente_id === userId 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-zinc-800 text-white'
                      }`}>
                        <div>{msg.contenido}</div>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {new Date(msg.created_at).toLocaleTimeString('es-PE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-zinc-900 border border-white/20 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-500 text-white"
                  />
                  <button 
                    onClick={enviarMensaje}
                    disabled={!nuevoMensaje.trim() || loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700 px-8 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}