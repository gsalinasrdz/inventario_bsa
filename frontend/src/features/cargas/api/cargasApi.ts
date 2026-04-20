import apiClient from '@/api/client'
import type { CargaFilters } from '../types/carga.types'

export const cargasApi = {
  getCargas: (filters: CargaFilters = {}) =>
    apiClient.get('/cargas', { params: filters }).then(r => r.data),

  getCarga: (id: number) =>
    apiClient.get(`/cargas/${id}`).then(r => r.data),

  crearCarga: (data: any) =>
    apiClient.post('/cargas', data).then(r => r.data),

  actualizarCarga: (id: number, data: any) =>
    apiClient.put(`/cargas/${id}`, data).then(r => r.data),

  eliminarCarga: (id: number) =>
    apiClient.delete(`/cargas/${id}`).then(r => r.data),

  iniciarCarga: (id: number) =>
    apiClient.post(`/cargas/${id}/iniciar`).then(r => r.data),

  cancelarCarga: (id: number) =>
    apiClient.post(`/cargas/${id}/cancelar`).then(r => r.data),

  liquidarCarga: (id: number, data: any) =>
    apiClient.post(`/cargas/${id}/liquidar`, data).then(r => r.data),

  getLiquidacion: (cargaId: number) =>
    apiClient.get(`/cargas/${cargaId}/liquidacion`).then(r => r.data),
}
