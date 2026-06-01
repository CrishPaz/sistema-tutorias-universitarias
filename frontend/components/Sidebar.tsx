'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import {
  LayoutDashboard, CalendarPlus, BookOpen, MessageSquare, Bell,
  User, Clock, Users, BarChart3, LogOut, Menu, X, GraduationCap
} from 'lucide-react'

interface Item {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Módulos por rol. Las rutas coinciden con las del route group (app).
const MENUS: Record<string, Item[]> = {
  ESTUDIANTE: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/sesiones/reservar', label: 'Reservar', icon: CalendarPlus },
    { href: '/sesiones', label: 'Mis sesiones', icon: BookOpen },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
  ],
  TUTOR: [
    { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/tutor/perfil', label: 'Mi perfil', icon: User },
    { href: '/tutor/disponibilidad', label: 'Disponibilidad', icon: Clock },
    { href: '/sesiones', label: 'Mis sesiones', icon: BookOpen },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { href: '/admin/materias', label: 'Materias', icon: BookOpen },
    { href: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
    { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
  ],
}
MENUS.COORDINADOR = MENUS.ADMIN

const ROL_LABEL: Record<string, string> = {
  ESTUDIANTE: 'Estudiante',
  TUTOR: 'Tutor',
  ADMIN: 'Administrador',
  COORDINADOR: 'Coordinador',
}

// Clases literales por acento (Tailwind solo genera strings completos presentes en el código).
const ACCENT = {
  purple: {
    brand: 'bg-purple-600',
    activeBg: 'bg-purple-600/20',
    activeText: 'text-purple-300',
    roleText: 'text-purple-400',
    avatar: 'bg-purple-600/30',
  },
  emerald: {
    brand: 'bg-emerald-600',
    activeBg: 'bg-emerald-600/20',
    activeText: 'text-emerald-300',
    roleText: 'text-emerald-400',
    avatar: 'bg-emerald-600/30',
  },
}

export default function Sidebar() {
  const { nombre, rol, logout } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const items = MENUS[rol || 'ESTUDIANTE'] || MENUS.ESTUDIANTE
  const a = rol === 'TUTOR' ? ACCENT.emerald : ACCENT.purple

  const isActive = (href: string) =>
    pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'))

  const Nav = (
    <div className="flex flex-col h-full">
      {/* Marca */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-white/10">
        <div className={`w-9 h-9 ${a.brand} rounded-2xl flex items-center justify-center`}>
          <GraduationCap className="w-5 h-5" />
        </div>
        <span className="font-semibold text-xl">Tutorias</span>
      </div>

      {/* Módulos */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {items.map((it) => {
          const active = isActive(it.href)
          return (
            <Link
              key={it.href}
              href={it.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                active
                  ? `${a.activeBg} ${a.activeText}`
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <it.icon className="w-5 h-5 shrink-0" />
              {it.label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + logout */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className={`w-9 h-9 rounded-full ${a.avatar} flex items-center justify-center text-sm font-semibold`}>
            {(nombre || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate text-sm">{nombre || 'Usuario'}</div>
            <div className={`text-xs ${a.roleText}`}>{ROL_LABEL[rol || ''] || rol}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-white/10 rounded-xl"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar fijo (desktop) */}
      <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 glass border-r border-white/10">
        {Nav}
      </aside>

      {/* Drawer (móvil) */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 w-64 h-full bg-zinc-950 border-r border-white/10">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-4 text-zinc-400"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
            {Nav}
          </aside>
        </div>
      )}
    </>
  )
}
