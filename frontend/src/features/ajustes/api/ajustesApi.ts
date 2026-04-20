import apiClient from '@/api/client'
import type { AjusteFilters } from '../types/ajuste.types'

export const ajustesApi = {
  getAjustes:  (f: AjusteFilters = {}) => apiClient.get('/ajustes', { params: f }).then(r => r.data),
  getAjuste:   (id: number)            => apiClient.get(`/ajustes/${id}`).then(r => r.data),
  crearAjuste: (data: any)             => apiClient.post('/ajustes', data).then(r => r.data),
  aprobar:     (id: number)            => apiClient.post(`/ajustes/${id}/aprobar`).then(r => r.data),
  rechazar:    (id: number)            => apiClient.post(`/ajustes/${id}/rechazar`).then(r => r.data),
}
