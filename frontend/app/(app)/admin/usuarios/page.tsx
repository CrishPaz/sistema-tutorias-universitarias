'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Users, ShieldCheck, ShieldX, Power } from 'lucide-react'

interface Usuario {
  id: string
  email: string
  nombreCompleto: string
  rol: string
  estado: string
  telefono?: string
}

const ESTADO_STYLE: Record<string, string> = {
  ACTIVO: 'bg-emerald-500/20 text-emerald-400',
  INACTIVO: 'bg-zinc-500/20 text-zinc-300',
  SUSPENDIDO: 'bg-red-500/20 text-red-400',
}

const ROL_STYLE: Record<string, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-300',
  COORDINADOR: 'bg-blue-500/20 text-blue-300',
  TUTOR: 'bg-emerald-500/20 text-emerald-300',
  ESTUDIANTE: 'bg-zinc-500/20 text-zinc-300',
}

export default function AdminUsuarios() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    const rol = localStorage.getItem('rol')
    if (rol && rol !== 'ADMIN' && rol !== 'COORDINADOR') {
      router.replace('/dashboard')
      return
    }
    cargar()
  }, [router])

  const cargar = async () => {
    try {
      const res = await api.get('/admin/usuarios')
      setUsuarios(res.data)
    } catch {
      setMensaje('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (id: string, estado: string) => {
    try {
      await api.patch(`/admin/usuarios/${id}/estado`, { estado })
      setUsuarios(prev => prev.map(u => u.id === id ? { ...u, estado } : u))
    } catch {
      setMensaje('No se pudo cambiar el estado')
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-8 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-semibold tracking-tight flex items-center gap-3 mb-2">
          <Users className="w-10 h-10 text-purple-400" /> Usuarios
        </h1>
        <p className="text-zinc-400 mb-10">Gestiona el estado de las cuentas de la plataforma</p>

        {mensaje && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-2xl mb-6">{mensaje}</div>
        )}

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Cargando...</div>
        ) : (
          <div className="glass rounded-3xl border border-white/10 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-sm text-zinc-400">
                <tr>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Rol</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-t border-white/5">
                    <td className="px-6 py-4 font-medium">{u.nombreCompleto}</td>
                    <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ROL_STYLE[u.rol] || ''}`}>{u.rol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ESTADO_STYLE[u.estado] || ''}`}>{u.estado}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {u.estado !== 'ACTIVO' && (
                          <button onClick={() => cambiarEstado(u.id, 'ACTIVO')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40">
                            <ShieldCheck className="w-3.5 h-3.5" /> Activar
                          </button>
                        )}
                        {u.estado !== 'SUSPENDIDO' && (
                          <button onClick={() => cambiarEstado(u.id, 'SUSPENDIDO')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-red-600/20 text-red-300 hover:bg-red-600/40">
                            <ShieldX className="w-3.5 h-3.5" /> Suspender
                          </button>
                        )}
                        {u.estado !== 'INACTIVO' && (
                          <button onClick={() => cambiarEstado(u.id, 'INACTIVO')}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-xl bg-white/10 text-zinc-300 hover:bg-white/20">
                            <Power className="w-3.5 h-3.5" /> Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
