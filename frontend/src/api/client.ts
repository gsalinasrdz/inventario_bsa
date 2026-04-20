import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'

const API_URL     = import.meta.env.VITE_API_URL as string
const SANCTUM_URL = import.meta.env.VITE_SANCTUM_URL as string

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,      // Cookies httpOnly de Sanctum
  withXSRFToken: true,        // CSRF automático de Sanctum
  headers: {
    'Content-Type':     'application/json',
    'Accept':           'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Obtiene la cookie CSRF antes del primer request autenticado
export const initSanctum = () =>
  axios.get(`${SANCTUM_URL}/sanctum/csrf-cookie`, { withCredentials: true })

// Interceptor de respuesta: maneja 401 y 403 globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearUser()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default apiClient
