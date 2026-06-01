'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface AuthState {
  token: string | null
  userId: string | null
  nombre: string | null
  rol: string | null
}

interface AuthContextValue extends AuthState {
  loading: boolean
  refresh: () => void
  logout: () => void
}

const empty: AuthState = { token: null, userId: null, nombre: null, rol: null }

const AuthContext = createContext<AuthContextValue>({
  ...empty,
  loading: true,
  refresh: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(empty)
  const [loading, setLoading] = useState(true)

  const refresh = () => {
    setState({
      token: localStorage.getItem('token'),
      userId: localStorage.getItem('userId'),
      nombre: localStorage.getItem('nombre'),
      rol: localStorage.getItem('rol'),
    })
    setLoading(false)
  }

  useEffect(() => {
    refresh()
  }, [])

  const logout = () => {
    localStorage.clear()
    window.location.href = '/auth/login'
  }

  return (
    <AuthContext.Provider value={{ ...state, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
