import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mermasApi } from '../api/mermasApi'
import type { MermaFilters } from '../types/merma.types'

const KEYS = {
  all:    ['mermas'] as const,
  list:   (f: MermaFilters) => ['mermas', 'list', f] as const,
  detail: (id: number)      => ['mermas', 'detail', id] as const,
}

export function useMermas(filters: MermaFilters = {}) {
  return useQuery({ queryKey: KEYS.list(filters), queryFn: () => mermasApi.getMermas(filters) })
}

export function useMerma(id: number) {
  return useQuery({ queryKey: KEYS.detail(id), queryFn: () => mermasApi.getMerma(id), enabled: !!id })
}

export function useCrearMerma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => mermasApi.crearMerma(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success(res.message ?? 'Merma registrada.')
    },
  })
}

export function useAprobarMerma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => mermasApi.aprobar(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Merma aprobada.')
    },
  })
}

export function useRechazarMerma() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => mermasApi.rechazar(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success(res.message ?? 'Merma rechazada.')
    },
  })
}
