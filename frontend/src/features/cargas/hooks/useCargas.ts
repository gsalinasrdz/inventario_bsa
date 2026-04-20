import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cargasApi } from '../api/cargasApi'
import type { CargaFilters } from '../types/carga.types'

export const CARGA_KEYS = {
  all:    ['cargas'] as const,
  list:   (f: CargaFilters) => ['cargas', 'list', f] as const,
  detail: (id: number) => ['cargas', 'detail', id] as const,
}

export function useCargas(filters: CargaFilters = {}) {
  return useQuery({ queryKey: CARGA_KEYS.list(filters), queryFn: () => cargasApi.getCargas(filters) })
}

export function useCarga(id: number) {
  return useQuery({ queryKey: CARGA_KEYS.detail(id), queryFn: () => cargasApi.getCarga(id), enabled: !!id })
}

export function useCrearCarga() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => cargasApi.crearCarga(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: CARGA_KEYS.all })
      toast.success(res.message ?? 'Carga creada.')
    },
  })
}

export function useIniciarCarga() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cargasApi.iniciarCarga(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: CARGA_KEYS.all })
      qc.invalidateQueries({ queryKey: CARGA_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Carga iniciada.')
    },
  })
}

export function useCancelarCarga() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cargasApi.cancelarCarga(id),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: CARGA_KEYS.all })
      qc.invalidateQueries({ queryKey: CARGA_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Carga cancelada.')
    },
  })
}

export function useLiquidarCarga() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => cargasApi.liquidarCarga(id, data),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: CARGA_KEYS.all })
      qc.invalidateQueries({ queryKey: CARGA_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Liquidación registrada.')
    },
  })
}

export function useEliminarCarga() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cargasApi.eliminarCarga(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CARGA_KEYS.all })
      toast.success('Carga eliminada.')
    },
  })
}
