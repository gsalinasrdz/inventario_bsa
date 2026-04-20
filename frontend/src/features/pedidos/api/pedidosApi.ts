import apiClient from '@/api/client'
import type { PedidoFilters } from '@/features/ventas/types/venta.types'

export const pedidosApi = {
  getPedidos: (filters: PedidoFilters = {}) =>
    apiClient.get('/pedidos', { params: filters }).then(r => r.data),

  getPedido: (id: number) =>
    apiClient.get(`/pedidos/${id}`).then(r => r.data),

  crearPedido: (data: any) =>
    apiClient.post('/pedidos', data).then(r => r.data),

  confirmarPedido: (id: number) =>
    apiClient.post(`/pedidos/${id}/confirmar`).then(r => r.data),

  cancelarPedido: (id: number) =>
    apiClient.post(`/pedidos/${id}/cancelar`).then(r => r.data),

  convertirVenta: (id: number, data: { almacen_id: number; tipo_pago: string }) =>
    apiClient.post(`/pedidos/${id}/convertir-venta`, data).then(r => r.data),
}
