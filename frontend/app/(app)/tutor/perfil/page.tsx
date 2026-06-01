'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Save, User, Award, Plus, Trash2, Star } from 'lucide-react'

interface Certificacion {
  nombre: string
  institucion?: string
  anio?: number | string
}

export default function PerfilTutor() {
  const [perfil, setPerfil] = useState<any>(null)
  const [certificaciones, setCertificaciones] = useState<Certificacion[]>([])
  const [resenas, setResenas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  useEffect(() => {
    cargarPerfil()
  }, [userId])

  const cargarPerfil = async () => {
    try {
      const res = await api.get(`/tutores/perfil/${userId}`)
      // biografia ahora vive en usuario; la elevamos a nivel raíz para editar
      setPerfil({ ...res.data, biografia: res.data.usuario?.biografia || '' })
      setCertificaciones(res.data.certificaciones || [])
      // Reseñas recibidas (sesiones calificadas por estudiantes)
      try {
        const ses = await api.get(`/sesiones/tutor/${userId}`)
        setResenas((ses.data || []).filter((s: any) => s.calificacionEstudiante != null))
      } catch { /* sin reseñas */ }
    } catch (error) {
      console.error('Error cargando perfil')
    } finally {
      setLoading(false)
    }
  }

  const guardarPerfil = async () => {
    setSaving(true)
    try {
      // 1) Datos del perfil (biografia se enruta a usuario en el backend)
      await api.put(`/tutores/perfil/${userId}`, perfil)
      // 2) Certificaciones (lista 1:N, se reemplaza completa)
      await api.put(`/tutores/certificaciones/${userId}`, {
        certificaciones: certificaciones.filter(c => c.nombre?.trim())
      })
      setMensaje('Perfil actualizado correctamente')
      setTimeout(() => setMensaje(''), 3000)
    } catch (error) {
      setMensaje('Error al guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const agregarCertificacion = () =>
    setCertificaciones([...certificaciones, { nombre: '', institucion: '', anio: '' }])

  const quitarCertificacion = (i: number) =>
    setCertificaciones(certificaciones.filter((_, idx) => idx !== i))

  const actualizarCert = (i: number, campo: keyof Certificacion, valor: string) =>
    setCertificaciones(certificaciones.map((c, idx) => idx === i ? { ...c, [campo]: valor } : c))

  if (loading) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
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

          {/* Certificaciones (1:N) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" /> Certificaciones
              </label>
              <button
                type="button"
                onClick={agregarCertificacion}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 rounded-xl text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {certificaciones.length === 0 ? (
              <p className="text-sm text-zinc-500">Aún no has agregado certificaciones.</p>
            ) : (
              <div className="space-y-3">
                {certificaciones.map((cert, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-3 items-stretch bg-zinc-900/50 p-3 rounded-2xl">
                    <input
                      placeholder="Nombre de la certificación"
                      value={cert.nombre || ''}
                      onChange={(e) => actualizarCert(i, 'nombre', e.target.value)}
                      className="flex-[2] bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-white text-sm"
                    />
                    <input
                      placeholder="Institución"
                      value={cert.institucion || ''}
                      onChange={(e) => actualizarCert(i, 'institucion', e.target.value)}
                      className="flex-1 bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Año"
                      value={cert.anio ?? ''}
                      onChange={(e) => actualizarCert(i, 'anio', e.target.value)}
                      className="w-24 bg-zinc-900 border border-white/20 rounded-xl px-4 py-3 text-white text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => quitarCertificacion(i)}
                      className="px-3 flex items-center justify-center text-red-400 hover:bg-red-500/10 rounded-xl"
                      aria-label="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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

        {/* Reseñas recibidas (#10) */}
        <div className="glass p-10 rounded-3xl border border-white/10 mt-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-400" /> Reseñas recibidas
          </h2>
          {resenas.length === 0 ? (
            <p className="text-sm text-zinc-500">Aún no tienes reseñas de estudiantes.</p>
          ) : (
            <div className="space-y-4">
              {resenas.map((s, i) => (
                <div key={i} className="bg-zinc-900/50 p-5 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(n => (
                        <Star key={n} className={`w-4 h-4 ${n <= s.calificacionEstudiante ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-zinc-500">{s.materia?.nombre} · {s.estudiante?.usuario?.nombreCompleto}</span>
                  </div>
                  {s.resenaEstudiante && <p className="text-zinc-300 mt-2 text-sm italic">“{s.resenaEstudiante}”</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
