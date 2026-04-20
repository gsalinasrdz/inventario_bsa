import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ventasApi } from '../api/ventasApi'
import type { VentaFilters, PedidoFilters } from '../types/venta.types'

export const VENTA_KEYS = {
  all:       ['ventas'] as const,
  list:      (f: VentaFilters) => ['ventas', 'list', f] as const,
  detail:    (id: number) => ['ventas', 'detail', id] as const,
  pedidos:   ['pedidos'] as const,
  pedList:   (f: PedidoFilters) => ['pedidos', 'list', f] as const,
  pedDetail: (id: number) => ['pedidos', 'detail', id] as const,
}

export function useVentas(filters: VentaFilters = {}) {
  return useQuery({ queryKey: VENTA_KEYS.list(filters), queryFn: () => ventasApi.getVentas(filters) })
}

export function useVenta(id: number) {
  return useQuery({ queryKey: VENTA_KEYS.detail(id), queryFn: () => ventasApi.getVenta(id), enabled: !!id })
}

export function useCrearVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => ventasApi.crearVenta(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: VENTA_KEYS.all })
      qc.invalidateQueries({ queryKey: ['stock'] })
      qc.invalidateQueries({ queryKey: ['clientes'] })
      toast.success(res.message ?? 'Venta registrada.')
    },
  })
}

export function useCancelarVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo?: string }) =>
      ventasApi.cancelarVenta(id, motivo),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: VENTA_KEYS.all })
      qc.invalidateQueries({ queryKey: VENTA_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success('Venta cancelada y stock revertido.')
    },
  })
}

export function usePedidos(filters: PedidoFilters = {}) {
  return useQuery({ queryKey: VENTA_KEYS.pedList(filters), queryFn: () => ventasApi.getPedidos(filters) })
}

export function usePedido(id: number) {
  return useQuery({ queryKey: VENTA_KEYS.pedDetail(id), queryFn: () => ventasApi.getPedido(id), enabled: !!id })
}

export function useCrearPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => ventasApi.crearPedido(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTA_KEYS.pedidos })
      toast.success('Pedido creado.')
    },
  })
}

export function useConfirmarPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ventasApi.confirmarPedido(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: VENTA_KEYS.pedidos })
      qc.invalidateQueries({ queryKey: VENTA_KEYS.pedDetail(id) })
      toast.success('Pedido confirmado.')
    },
  })
}

export function useCancelarPedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ventasApi.cancelarPedido(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: VENTA_KEYS.pedidos })
      toast.success('Pedido cancelado.')
    },
  })
}

export function useConvertirVenta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => ventasApi.convertirVenta(id, data),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: VENTA_KEYS.pedidos })
      qc.invalidateQueries({ queryKey: VENTA_KEYS.pedDetail(id) })
      qc.invalidateQueries({ queryKey: VENTA_KEYS.all })
      qc.invalidateQueries({ queryKey: ['stock'] })
      toast.success(res.message ?? 'Venta generada desde pedido.')
    },
  })
}
