import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { devolucionesApi } from '../api/devolucionesApi'
import type { DevolucionFilters } from '../types/devolucion.types'

const KEYS = {
  all:    ['devoluciones'] as const,
  list:   (f: DevolucionFilters) => ['devoluciones', 'list', f] as const,
  detail: (id: number)           => ['devoluciones', 'detail', id] as const,
}

export function useDevoluciones(filters: DevolucionFilters = {}) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => devolucionesApi.getDevoluciones(filters) })
}

export function useDevolucion(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => devolucionesApi.getDevolucion(id), enabled: !!id })
}

export function useCrearDevolucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => devolucionesApi.crearDevolucion(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(res.message ?? 'Devolución registrada.')
    },
  })
}

export function useAprobarDevolucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => devolucionesApi.aprobar(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Devolución aprobada.')
    },
  })
}

export function useRechazarDevolucion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => devolucionesApi.rechazar(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success(res.message ?? 'Devolución rechazada.')
    },
  })
}
