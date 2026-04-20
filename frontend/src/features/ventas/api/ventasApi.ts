import apiClient from '@/api/client'
import type { VentaFilters, PedidoFilters } from '../types/venta.types'

export const ventasApi = {
  getVentas: (f: VentaFilters = {}) =>
    apiClient.get('/ventas', { params: f }).then(r => r.data),

  getVenta: (id: number) =>
    apiClient.get(`/ventas/${id}`).then(r => r.data),

  crearVenta: (data: any) =>
    apiClient.post('/ventas', data).then(r => r.data),

  cancelarVenta: (id: number, motivo: string = '') =>
    apiClient.post(`/ventas/${id}/cancelar`, { motivo }).then(r => r.data),

  getPedidos: (f: PedidoFilters = {}) =>
    apiClient.get('/pedidos', { params: f }).then(r => r.data),

  getPedido: (id: number) =>
    apiClient.get(`/pedidos/${id}`).then(r => r.data),

  crearPedido: (data: any) =>
    apiClient.post('/pedidos', data).then(r => r.data),

  confirmarPedido: (id: number) =>
    apiClient.post(`/pedidos/${id}/confirmar`).then(r => r.data),

  cancelarPedido: (id: number) =>
    apiClient.post(`/pedidos/${id}/cancelar`).then(r => r.data),

  convertirVenta: (id: number, data: any) =>
    apiClient.post(`/pedidos/${id}/convertir-venta`, data).then(r => r.data),
}
