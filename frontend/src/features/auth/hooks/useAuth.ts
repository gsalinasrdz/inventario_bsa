import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '../api/authApi'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'
import type { LoginFormValues } from '../schemas/loginSchema'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/common'

export function useLogin() {
  const navigate  = useNavigate()
  const { setUser } = useAuthStore()

  return useMutation({
    mutationFn: (data: LoginFormValues) => authApi.login(data),
    onSuccess: ({ data }) => {
      setUser(data.user, data.permissions)
      toast.success(`Bienvenido, ${data.user.nombre}.`)
      navigate('/dashboard', { replace: true })
    },
    onError: (error: AxiosError<ApiError>) => {
      const code    = error.response?.data?.error?.code
      const message = error.response?.data?.error?.message

      if (code === 'ACCOUNT_LOCKED') {
        toast.error(message ?? 'Cuenta bloqueada temporalmente.', { duration: 8000 })
      } else if (code === 'ACCOUNT_DISABLED') {
        toast.error('Esta cuenta está desactivada. Contacte al administrador.')
      } else {
        toast.error(message ?? 'Credenciales incorrectas.')
      }
    },
  })
}

export function useLogout() {
  const { clearUser } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearUser()
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}
