'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { BookOpen, Plus, Trash2, Save, X } from 'lucide-react'

interface Materia {
  id?: string
  codigo: string
  nombre: string
  descripcion?: string
  creditos: number
  departamento?: string
}

const VACIA: Materia = { codigo: '', nombre: '', descripcion: '', creditos: 3, departamento: '' }

export default function AdminMaterias() {
  const router = useRouter()
  const [materias, setMaterias] = useState<Materia[]>([])
  const [editando, setEditando] = useState<Materia | null>(null)
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
      const res = await api.get('/materias')
      setMaterias(res.data)
    } catch {
      setMensaje('Error cargando materias')
    } finally {
      setLoading(false)
    }
  }

  const guardar = async () => {
    if (!editando) return
    try {
      if (editando.id) {
        await api.put(`/materias/${editando.id}`, editando)
      } else {
        await api.post('/materias', editando)
      }
      setEditando(null)
      cargar()
    } catch (e: any) {
      setMensaje(e.response?.data?.message || 'Error al guardar')
      setTimeout(() => setMensaje(''), 4000)
    }
  }

  const eliminar = async (id?: string) => {
    if (!id || !confirm('¿Eliminar esta materia?')) return
    try {
      await api.delete(`/materias/${id}`)
      cargar()
    } catch (e: any) {
      setMensaje(e.response?.data?.message || 'Error al eliminar')
      setTimeout(() => setMensaje(''), 4000)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-semibold tracking-tight flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-blue-400" /> Materias
            </h1>
            <p className="text-zinc-400 mt-2">Catálogo de materias de la plataforma</p>
          </div>
          <button onClick={() => setEditando({ ...VACIA })}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-2xl font-medium hover:bg-zinc-100">
            <Plus className="w-5 h-5" /> Nueva materia
          </button>
        </div>

        {mensaje && (
          <div className="bg-red-950/50 border border-red-900 text-red-400 p-4 rounded-2xl mb-6">{mensaje}</div>
        )}

        {editando && (
          <div className="glass p-8 rounded-3xl border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">{editando.id ? 'Editar materia' : 'Nueva materia'}</h3>
              <button onClick={() => setEditando(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="Código (ej. MAT101)" value={editando.codigo}
                onChange={e => setEditando({ ...editando, codigo: e.target.value })}
                className="bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 text-white" />
              <input placeholder="Nombre" value={editando.nombre}
                onChange={e => setEditando({ ...editando, nombre: e.target.value })}
                className="bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 text-white" />
              <input placeholder="Departamento" value={editando.departamento || ''}
                onChange={e => setEditando({ ...editando, departamento: e.target.value })}
                className="bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 text-white" />
              <input type="number" placeholder="Créditos" value={editando.creditos}
                onChange={e => setEditando({ ...editando, creditos: parseInt(e.target.value) || 0 })}
                className="bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 text-white" />
              <textarea placeholder="Descripción" value={editando.descripcion || ''}
                onChange={e => setEditando({ ...editando, descripcion: e.target.value })}
                className="md:col-span-2 bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 text-white" rows={2} />
            </div>
            <button onClick={guardar}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-2xl font-medium">
              <Save className="w-5 h-5" /> Guardar
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-zinc-400">Cargando...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materias.map(m => (
              <div key={m.id} className="glass p-6 rounded-3xl border border-white/10 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-zinc-500">{m.codigo}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{m.creditos} créditos</span>
                  </div>
                  <div className="font-semibold text-lg">{m.nombre}</div>
                  <div className="text-sm text-zinc-400">{m.departamento}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditando(m)} className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20">Editar</button>
                  <button onClick={() => eliminar(m.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
