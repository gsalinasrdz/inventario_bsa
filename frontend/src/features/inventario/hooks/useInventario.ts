import { useQuery } from '@tanstack/react-query'
import { inventarioApi } from '../api/inventarioApi'
import type { StockFilters, MovimientoFilters } from '../types/inventario.types'

export const STOCK_KEYS = {
  all:        ['stock'] as const,
  list:       (f: StockFilters) => ['stock', 'list', f] as const,
  detail:     (id: number) => ['stock', 'detail', id] as const,
  resumen:    ['stock', 'resumen'] as const,
  movimientos:(f: MovimientoFilters) => ['movimientos', f] as const,
  kardex:     (id: number, f: object) => ['kardex', id, f] as const,
}

export function useStock(filters: StockFilters = {}) {
  return useQuery({
    queryKey: STOCK_KEYS.list(filters),
    queryFn:  () => inventarioApi.getStock(filters),
  })
}

export function useStockProducto(productoId: number) {
  return useQuery({
    queryKey: STOCK_KEYS.detail(productoId),
    queryFn:  () => inventarioApi.getStockProducto(productoId),
    enabled:  !!productoId,
  })
}

export function useStockResumen() {
  return useQuery({
    queryKey: STOCK_KEYS.resumen,
    queryFn:  inventarioApi.getResumen,
    staleTime: 60_000,
  })
}

export function useMovimientos(filters: MovimientoFilters = {}) {
  return useQuery({
    queryKey: STOCK_KEYS.movimientos(filters),
    queryFn:  () => inventarioApi.getMovimientos(filters),
  })
}

export function useKardex(productoId: number, filters: Omit<MovimientoFilters, 'producto_id'> = {}) {
  return useQuery({
    queryKey: STOCK_KEYS.kardex(productoId, filters),
    queryFn:  () => inventarioApi.getKardex(productoId, filters),
    enabled:  !!productoId,
  })
}
