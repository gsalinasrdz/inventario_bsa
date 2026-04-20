import apiClient from '@/api/client'
import type { OrdenCompraFilters } from '../types/compra.types'

export const comprasApi = {
  getOrdenes: (filters: OrdenCompraFilters = {}) =>
    apiClient.get('/ordenes-compra', { params: filters }).then(r => r.data),

  getOrden: (id: number) =>
    apiClient.get(`/ordenes-compra/${id}`).then(r => r.data),

  crearOrden: (data: any) =>
    apiClient.post('/ordenes-compra', data).then(r => r.data),

  actualizarOrden: (id: number, data: any) =>
    apiClient.put(`/ordenes-compra/${id}`, data).then(r => r.data),

  eliminarOrden: (id: number) =>
    apiClient.delete(`/ordenes-compra/${id}`).then(r => r.data),

  aprobarOrden: (id: number) =>
    apiClient.post(`/ordenes-compra/${id}/aprobar`).then(r => r.data),

  getRecepciones: (filters: any = {}) =>
    apiClient.get('/recepciones', { params: filters }).then(r => r.data),

  getRecepcion: (id: number) =>
    apiClient.get(`/recepciones/${id}`).then(r => r.data),

  crearRecepcion: (data: any) =>
    apiClient.post('/recepciones', data).then(r => r.data),

  crearRecepcionDeOrden: (ordenId: number, data: any) =>
    apiClient.post(`/ordenes-compra/${ordenId}/recibir`, data).then(r => r.data),
}
