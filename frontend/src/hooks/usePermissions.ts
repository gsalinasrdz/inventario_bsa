import { useAuthStore } from '@/store/authStore'

export function usePermissions() {
  const { hasPermission, hasRole, hasAnyRole, permissions, user } = useAuthStore()

  return {
    can:        hasPermission,
    hasRole,
    hasAnyRole,
    permissions,
    isAdmin:    hasRole('ADMIN'),
    isGerente:  hasAnyRole(['ADMIN', 'GERENTE']),
    user,
  }
}
