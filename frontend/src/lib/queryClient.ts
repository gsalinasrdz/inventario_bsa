import { QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/common'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          30 * 1000,  // 30 segundos
      gcTime:             5 * 60 * 1000,  // 5 minutos
      retry:              1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      onError: (error) => {
        const axiosError = error as AxiosError<ApiError>
        const message = axiosError.response?.data?.error?.message
          ?? 'Ocurrió un error inesperado.'
        toast.error(message)
      },
    },
  },
})
