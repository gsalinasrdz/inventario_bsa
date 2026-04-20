import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface Props {
  children: React.ReactNode
  permission?: string
  role?: string
}

export default function ProtectedRoute({ children, permission, role }: Props) {
  const { isAuthenticated, hasPermission, hasRole } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-2xl font-bold text-destructive">403</p>
        <p className="text-muted-foreground">No tiene permisos para ver esta sección.</p>
      </div>
    )
  }

  if (role && !hasRole(role)) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-2xl font-bold text-destructive">403</p>
        <p className="text-muted-foreground">Acceso restringido.</p>
      </div>
    )
  }

  return <>{children}</>
}
