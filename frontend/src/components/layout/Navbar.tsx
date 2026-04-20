import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import { queryClient } from '@/lib/queryClient'

export default function Navbar() {
  const { user, clearUser } = useAuthStore()

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
    onSuccess: () => {
      clearUser()
      queryClient.clear()
      toast.success('Sesión cerrada correctamente.')
    },
    onError: () => {
      // Limpiar localmente aunque falle el servidor
      clearUser()
      queryClient.clear()
    },
  })

  return (
    <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 flex-shrink-0">
      <div />

      <div className="flex items-center gap-4">
        {/* Info usuario */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="font-medium text-gray-900 leading-none">{user?.nombre_completo}</p>
            <p className="text-xs text-muted-foreground">{user?.roles?.[0] ?? ''}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded"
          title="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
