import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ajustesApi } from '../api/ajustesApi'
import type { AjusteFilters } from '../types/ajuste.types'

const KEYS = {
  all:    ['ajustes'] as const,
  list:   (f: AjusteFilters) => ['ajustes', 'list', f] as const,
  detail: (id: number)       => ['ajustes', 'detail', id] as const,
}

export function useAjustes(filters: AjusteFilters = {}) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => ajustesApi.getAjustes(filters) })
}

export function useAjuste(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => ajustesApi.getAjuste(id), enabled: !!id })
}

export function useCrearAjuste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => ajustesApi.crearAjuste(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(res.message ?? 'Ajuste registrado.')
    },
  })
}

export function useAprobarAjuste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ajustesApi.aprobar(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Ajuste aprobado.')
    },
  })
}

export function useRechazarAjuste() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ajustesApi.rechazar(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success(res.message ?? 'Ajuste rechazado.')
    },
  })
}
