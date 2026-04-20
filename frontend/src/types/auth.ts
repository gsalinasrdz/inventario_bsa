export interface User {
  id: number
  nombre: string
  apellido: string
  nombre_completo: string
  email: string
  activo: boolean
  ultimo_acceso: string | null
  roles: string[]
  created_at: string
}

export interface AuthState {
  user: User | null
  permissions: string[]
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    user: User
    permissions: string[]
  }
  message: string
}

export type Role = 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'ALMACENISTA'
