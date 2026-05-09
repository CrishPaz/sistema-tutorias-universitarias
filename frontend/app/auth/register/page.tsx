'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, GraduationCap } from 'lucide-react'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'ESTUDIANTE' | 'TUTOR'>('ESTUDIANTE')
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    password: '',
    telefono: '',
    matricula: '',
    carrera: '',
    semestre: '',
    especialidad: '',
    tituloAcademico: '',
    anosExperiencia: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: any = {
      nombreCompleto: formData.nombreCompleto,
      email: formData.email,
      password: formData.password,
      telefono: formData.telefono,
      rol: role
    }

    if (role === 'ESTUDIANTE') {
      payload.matricula = formData.matricula
      payload.carrera = formData.carrera
      payload.semestre = parseInt(formData.semestre)
    } else {
      payload.especialidad = formData.especialidad
      payload.tituloAcademico = formData.tituloAcademico
      payload.anosExperiencia = parseInt(formData.anosExperiencia) || 0
    }

    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', payload)
      
      // Auto-login después de registro
      const loginRes = await axios.post('http://localhost:8080/api/auth/login', {
        email: formData.email,
        password: formData.password
      })

      localStorage.setItem('token', loginRes.data.accessToken)
      localStorage.setItem('userId', loginRes.data.userId)
      localStorage.setItem('rol', loginRes.data.rol)
      localStorage.setItem('nombre', loginRes.data.nombreCompleto)

      if (role === 'TUTOR') {
        router.push('/tutor/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>

        <div className="glass p-10 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">Crea tu cuenta</h1>
            <p className="text-zinc-400 mt-2">Únete a la comunidad de Tutorias</p>
          </div>

          {/* Role Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-center text-sm text-zinc-400 mb-6">¿Cómo quieres usar Tutorias?</p>
              
              <button
                onClick={() => { setRole('ESTUDIANTE'); setStep(2) }}
                className="w-full p-6 border border-white/20 hover:border-purple-500 rounded-3xl flex items-center gap-4 transition-all group"
              >
                <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-600/30">
                  <GraduationCap className="w-7 h-7 text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Soy Estudiante</div>
                  <div className="text-sm text-zinc-400">Quiero recibir tutorías y mejorar mis calificaciones</div>
                </div>
              </button>

              <button
                onClick={() => { setRole('TUTOR'); setStep(2) }}
                className="w-full p-6 border border-white/20 hover:border-purple-500 rounded-3xl flex items-center gap-4 transition-all group"
              >
                <div className="w-14 h-14 bg-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600/30">
                  <User className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Soy Tutor / Docente</div>
                  <div className="text-sm text-zinc-400">Quiero impartir tutorías y generar ingresos</div>
                </div>
              </button>
            </div>
          )}

          {/* Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="text-sm font-medium text-zinc-300">Nombre completo</label>
                  <input name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 focus:border-purple-500" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-medium text-zinc-300">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-zinc-300">Teléfono</label>
                    <input name="telefono" value={formData.telefono} onChange={handleChange} className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 focus:border-purple-500" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-zinc-300">Contraseña</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3 focus:border-purple-500" />
                </div>

                {/* Estudiante fields */}
                {role === 'ESTUDIANTE' && (
                  <>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-zinc-300">Matrícula</label>
                        <input name="matricula" value={formData.matricula} onChange={handleChange} required className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-300">Semestre</label>
                        <input type="number" name="semestre" value={formData.semestre} onChange={handleChange} required className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-zinc-300">Carrera</label>
                      <input name="carrera" value={formData.carrera} onChange={handleChange} required className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3" placeholder="Ingeniería en Sistemas" />
                    </div>
                  </>
                )}

                {/* Tutor fields */}
                {role === 'TUTOR' && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-zinc-300">Especialidad</label>
                      <input name="especialidad" value={formData.especialidad} onChange={handleChange} required className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3" placeholder="Cálculo, Programación, IA..." />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-zinc-300">Título Académico</label>
                        <input name="tituloAcademico" value={formData.tituloAcademico} onChange={handleChange} className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3" placeholder="Dr. en Matemáticas" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-zinc-300">Años de experiencia</label>
                        <input type="number" name="anosExperiencia" value={formData.anosExperiencia} onChange={handleChange} className="mt-1.5 w-full bg-zinc-900 border border-white/20 rounded-2xl px-5 py-3" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {error && <div className="text-red-400 text-sm bg-red-950/50 p-3 rounded-2xl">{error}</div>}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-4 border border-white/20 rounded-2xl font-medium hover:bg-white/5">Atrás</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-4 bg-white text-black font-semibold rounded-2xl disabled:bg-zinc-700"
                >
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}