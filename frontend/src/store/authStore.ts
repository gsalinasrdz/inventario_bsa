import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/auth'

interface AuthStore {
  user: User | null
  permissions: string[]
  isAuthenticated: boolean
  setUser: (user: User, permissions: string[]) => void
  clearUser: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user:            null,
      permissions:     [],
      isAuthenticated: false,

      setUser: (user, permissions) =>
        set({ user, permissions, isAuthenticated: true }),

      clearUser: () =>
        set({ user: null, permissions: [], isAuthenticated: false }),

      hasPermission: (permission) =>
        get().permissions.includes(permission),

      hasRole: (role) =>
        get().user?.roles?.includes(role) ?? false,

      hasAnyRole: (roles) =>
        roles.some(role => get().user?.roles?.includes(role)),
    }),
    {
      name: 'hls-auth',
      // Solo persistir datos no sensibles
      partialize: (state) => ({
        user:            state.user,
        permissions:     state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
