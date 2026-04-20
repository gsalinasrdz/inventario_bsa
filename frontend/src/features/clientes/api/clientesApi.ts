import apiClient from '@/api/client'
import type { ClienteFilters } from '../types/cliente.types'
import type { ClienteFormValues } from '../schemas/clienteSchema'

export const clientesApi = {
  getAll: (filters: ClienteFilters = {}) =>
    apiClient.get('/clientes', { params: filters }).then(r => r.data),

  getOne: (id: number) =>
    apiClient.get(`/clientes/${id}`).then(r => r.data),

  create: (data: ClienteFormValues) =>
    apiClient.post('/clientes', data).then(r => r.data),

  update: (id: number, data: Partial<ClienteFormValues>) =>
    apiClient.put(`/clientes/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    apiClient.delete(`/clientes/${id}`).then(r => r.data),

  estadoCuenta: (id: number) =>
    apiClient.get(`/clientes/${id}/estado-cuenta`).then(r => r.data),
}
