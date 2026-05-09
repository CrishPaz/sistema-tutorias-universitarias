'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Calendar, Award, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
              <span className="font-bold text-xl">TU</span>
            </div>
            <span className="font-semibold text-2xl tracking-tight">Tutorias</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="px-6 py-2.5 text-sm font-medium hover:text-purple-400 transition-colors">
              Iniciar Sesión
            </Link>
            <Link 
              href="/auth/register" 
              className="px-6 py-2.5 bg-white text-black rounded-2xl text-sm font-semibold hover:bg-zinc-200 transition-all flex items-center gap-2"
            >
              Comenzar Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-emerald-400">Plataforma #1 en universidades de Latinoamérica</span>
          </div>

          <h1 className="text-7xl font-semibold tracking-tighter mb-6">
            Tutorías que <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">transforman</span><br />tu futuro académico
          </h1>
          
          <p className="text-2xl text-zinc-400 max-w-3xl mx-auto mb-10">
            Conecta con los mejores tutores universitarios. Reserva sesiones en minutos. 
            Mejora tus calificaciones con asesoría personalizada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-black rounded-3xl text-lg font-semibold hover:bg-zinc-100 transition-all group"
            >
              Empezar ahora gratis
              <ArrowRight className="group-hover:translate-x-1 transition" />
            </Link>
            <Link 
              href="#demo" 
              className="inline-flex items-center justify-center gap-3 px-10 py-4 border border-white/20 rounded-3xl text-lg font-medium hover:bg-white/5 transition-all"
            >
              Ver demo en vivo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Users, title: "Tutores Verificados", desc: "Solo los mejores docentes y estudiantes avanzados" },
            { icon: Calendar, title: "Reserva en Segundos", desc: "Calendario inteligente con disponibilidad real" },
            { icon: Award, title: "Resultados Garantizados", desc: "Mejora promedio de 2.3 puntos en calificaciones" },
            { icon: Shield, title: "100% Seguro", desc: "Pagos protegidos y privacidad total" }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass p-8 rounded-3xl border border-white/10 card-hover"
            >
              <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-zinc-900 py-20 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-5xl font-semibold tracking-tight mb-6">¿Listo para mejorar tus calificaciones?</h2>
          <p className="text-xl text-zinc-400 mb-10">Únete a más de 12,450 estudiantes que ya están usando Tutorias</p>
          
          <Link 
            href="/auth/register" 
            className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-3xl text-xl font-semibold hover:brightness-110 transition-all"
          >
            Crear mi cuenta gratis
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-12 text-center text-sm text-zinc-500">
        © 2026 Tutorias Universitarias • Plataforma Premium para Instituciones Educativas
      </footer>
    </div>
  )
}