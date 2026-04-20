import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { comprasApi } from '../api/comprasApi'
import type { OrdenCompraFilters } from '../types/compra.types'

export const COMPRA_KEYS = {
  all:          ['ordenes-compra'] as const,
  list:         (f: OrdenCompraFilters) => ['ordenes-compra', 'list', f] as const,
  detail:       (id: number) => ['ordenes-compra', 'detail', id] as const,
  recepciones:  ['recepciones'] as const,
  recepList:    (f: any) => ['recepciones', 'list', f] as const,
  recepDetail:  (id: number) => ['recepciones', 'detail', id] as const,
}

export function useOrdenes(filters: OrdenCompraFilters = {}) {
  return useQuery({
    queryKey: COMPRA_KEYS.list(filters),
    queryFn:  () => comprasApi.getOrdenes(filters),
  })
}

export function useOrden(id: number) {
  return useQuery({
    queryKey: COMPRA_KEYS.detail(id),
    queryFn:  () => comprasApi.getOrden(id),
    enabled:  !!id,
  })
}

export function useCrearOrden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => comprasApi.crearOrden(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMPRA_KEYS.all })
      toast.success('Orden de compra creada.')
    },
  })
}

export function useAprobarOrden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comprasApi.aprobarOrden(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: COMPRA_KEYS.all })
      qc.invalidateQueries({ queryKey: COMPRA_KEYS.detail(id) })
      toast.success('Orden enviada al proveedor.')
    },
  })
}

export function useEliminarOrden() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => comprasApi.eliminarOrden(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COMPRA_KEYS.all })
      toast.success('Orden eliminada.')
    },
  })
}

export function useRecepciones(filters: any = {}) {
  return useQuery({
    queryKey: COMPRA_KEYS.recepList(filters),
    queryFn:  () => comprasApi.getRecepciones(filters),
  })
}

export function useRecepcion(id: number) {
  return useQuery({
    queryKey: COMPRA_KEYS.recepDetail(id),
    queryFn:  () => comprasApi.getRecepcion(id),
    enabled:  !!id,
  })
}

export function useCrearRecepcion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ordenId, data }: { ordenId?: number; data: any }) =>
      ordenId
        ? comprasApi.crearRecepcionDeOrden(ordenId, data)
        : comprasApi.crearRecepcion(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: COMPRA_KEYS.all })
      qc.invalidateQueries({ queryKey: COMPRA_KEYS.recepciones })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Recepción procesada. Stock actualizado.')
    },
  })
}
