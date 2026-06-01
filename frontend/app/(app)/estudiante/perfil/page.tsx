'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Save, User } from 'lucide-react'

export default function PerfilEstudiante() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    const rol = localStorage.getItem('rol')
    if (rol && rol !== 'ESTUDIANTE' && rol !== 'ADMIN') {
      router.replace('/dashboard')
      return
    }
    cargar()
  }, [router])

  const cargar = async () => {
    try {
      const res = await api.get(`/estudiantes/perfil/${userId}`)
      setPerfil({ ...res.data, biografia: res.data.usuario?.biografia || '', fotoUrl: res.data.usuario?.fotoUrl || '' })
    } catch {
      setMensaje('No se pudo cargar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const guardar = async () => {
    setSaving(true)
    try {
      await api.put(`/estudiantes/perfil/${userId}`, {
        carrera: perfil.carrera,
        semestre: perfil.semestre,
        biografia: perfil.biografia,
        fotoUrl: perfil.fotoUrl,
      })
      setMensaje('Perfil actualizado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch {
      setMensaje('Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Cargando...</div>
  if (!perfil) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">{mensaje || 'Sin perfil'}</div>

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold tracking-tight flex items-center gap-3 mb-10">
          <User className="w-9 h-9" /> Mi Perfil
        </h1>

        {mensaje && (
          <div className="bg-emerald-950/50 border border-emerald-500 text-emerald-400 p-4 rounded-2xl mb-6">{mensaje}</div>
        )}

        <div className="glass p-10 rounded-3xl border border-white/10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Matrícula</label>
              <input value={perfil.matricula || ''} disabled
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Promedio general</label>
              <input value={perfil.promedioGeneral ?? ''} disabled
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl px-5 py-4 text-zinc-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Carrera</label>
              <input value={perfil.carrera || ''}
                onChange={e => setPerfil({ ...perfil, carrera: e.target.value })}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Semestre</label>
              <input type="number" min={1} max={12} value={perfil.semestre || 1}
                onChange={e => setPerfil({ ...perfil, semestre: parseInt(e.target.value) })}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">URL de foto</label>
            <input value={perfil.fotoUrl || ''}
              onChange={e => setPerfil({ ...perfil, fotoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Biografía</label>
            <textarea value={perfil.biografia || ''}
              onChange={e => setPerfil({ ...perfil, biografia: e.target.value })}
              rows={5}
              placeholder="Cuéntanos sobre ti, tus intereses y objetivos..."
              className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500" />
          </div>

          <button onClick={guardar} disabled={saving}
            className="w-full py-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-black font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all">
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
