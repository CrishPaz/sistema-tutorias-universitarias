'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { ArrowLeft, Save, User } from 'lucide-react'
import Link from 'next/link'

export default function PerfilTutor() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    if (!token || !userId) {
      router.push('/auth/login')
      return
    }

    cargarPerfil()
  }, [router, token, userId])

  const cargarPerfil = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/tutores/perfil/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPerfil(res.data)
    } catch (error) {
      console.error('Error cargando perfil')
    } finally {
      setLoading(false)
    }
  }

  const guardarPerfil = async () => {
    setSaving(true)
    try {
      await axios.put(`http://localhost:8080/api/tutores/perfil/${userId}`, perfil, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMensaje('Perfil actualizado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (error) {
      setMensaje('Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Link href="/tutor/dashboard" className="text-purple-400 hover:text-purple-300">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-4xl font-semibold tracking-tight flex items-center gap-3">
            <User className="w-9 h-9" /> Mi Perfil de Tutor
          </h1>
        </div>

        {mensaje && (
          <div className="bg-emerald-950/50 border border-emerald-500 text-emerald-400 p-4 rounded-2xl mb-6">
            {mensaje}
          </div>
        )}

        <div className="glass p-10 rounded-3xl border border-white/10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Especialidad</label>
              <select 
                value={perfil?.especialidad || ''} 
                onChange={(e) => setPerfil({...perfil, especialidad: e.target.value})}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
              >
                <option value="">Selecciona tu especialidad</option>
                <option value="Programación y Desarrollo de Software">Programación y Desarrollo de Software</option>
                <option value="Matemáticas Avanzadas y Cálculo">Matemáticas Avanzadas y Cálculo</option>
                <option value="Física y Química">Física y Química</option>
                <option value="Biología y Ciencias de la Vida">Biología y Ciencias de la Vida</option>
                <option value="Historia y Ciencias Sociales">Historia y Ciencias Sociales</option>
                <option value="Literatura y Lenguaje">Literatura y Lenguaje</option>
                <option value="Ingeniería de Sistemas">Ingeniería de Sistemas</option>
                <option value="Inteligencia Artificial y Datos">Inteligencia Artificial y Datos</option>
                <option value="Economía y Finanzas">Economía y Finanzas</option>
                <option value="Derecho y Ciencias Políticas">Derecho y Ciencias Políticas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Título Académico</label>
              <select 
                value={perfil?.tituloAcademico || ''} 
                onChange={(e) => setPerfil({...perfil, tituloAcademico: e.target.value})}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
              >
                <option value="">Selecciona tu título</option>
                <option value="Bachiller en Ingeniería">Bachiller en Ingeniería</option>
                <option value="Licenciado en Ciencias">Licenciado en Ciencias</option>
                <option value="Maestro en Ciencias">Maestro en Ciencias</option>
                <option value="Doctor en Filosofía">Doctor en Filosofía (PhD)</option>
                <option value="Ingeniero de Sistemas">Ingeniero de Sistemas</option>
                <option value="Magíster en Educación">Magíster en Educación</option>
                <option value="Especialista en su área">Especialista en su área</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Años de Experiencia</label>
              <input 
                type="number" 
                value={perfil?.anosExperiencia || 0} 
                onChange={(e) => setPerfil({...perfil, anosExperiencia: parseInt(e.target.value)})}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">Tarifa por Hora (S/)</label>
              <input 
                type="number" 
                value={perfil?.tarifaHora || 0} 
                onChange={(e) => setPerfil({...perfil, tarifaHora: parseFloat(e.target.value)})}
                className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-300">Biografía</label>
            <textarea 
              value={perfil?.biografia || ''} 
              onChange={(e) => setPerfil({...perfil, biografia: e.target.value})}
              rows={5}
              className="w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-4 text-white focus:border-purple-500"
              placeholder="Cuéntales a los estudiantes sobre ti..."
            />
          </div>

          <button 
            onClick={guardarPerfil}
            disabled={saving}
            className="w-full py-4 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-black font-semibold rounded-2xl flex items-center justify-center gap-3 transition-all"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}