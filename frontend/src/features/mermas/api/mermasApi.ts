import apiClient from '@/api/client'
import type { MermaFilters } from '../types/merma.types'

export const mermasApi = {
  getMermas:  (f: MermaFilters = {}) => apiClient.get('/mermas', { params: f }).then(r => r.data),
  getMerma:   (id: number)           => apiClient.get(`/mermas/${id}`).then(r => r.data),
  crearMerma: (data: any)            => apiClient.post('/mermas', data).then(r => r.data),
  aprobar:    (id: number)           => apiClient.post(`/mermas/${id}/aprobar`).then(r => r.data),
  rechazar:   (id: number)           => apiClient.post(`/mermas/${id}/rechazar`).then(r => r.data),
}
