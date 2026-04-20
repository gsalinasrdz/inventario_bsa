import apiClient from '@/api/client'
import type { DevolucionFilters } from '../types/devolucion.types'

export const devolucionesApi = {
  getDevoluciones: (f: DevolucionFilters = {}) => apiClient.get('/devoluciones', { params: f }).then(r => r.data),
  getDevolucion:   (id: number)              => apiClient.get(`/devoluciones/${id}`).then(r => r.data),
  crearDevolucion: (data: any)               => apiClient.post('/devoluciones', data).then(r => r.data),
  aprobar:         (id: number)              => apiClient.post(`/devoluciones/${id}/aprobar`).then(r => r.data),
  rechazar:        (id: number)              => apiClient.post(`/devoluciones/${id}/rechazar`).then(r => r.data),
}
