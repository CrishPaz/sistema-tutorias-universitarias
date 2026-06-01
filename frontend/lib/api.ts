import axios from 'axios'

// URL base de la API. Configurable por entorno; cae a localhost en desarrollo.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

const api = axios.create({ baseURL: API_URL })

// Inyecta el token JWT en cada petición.
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Ante un 401 (token expirado/inválido) limpia sesión y manda a login.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.clear()
      if (!window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
