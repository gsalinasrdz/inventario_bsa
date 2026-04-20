import apiClient from '@/api/client'

export const rutasApi = {
  getRutas: (params: Record<string, any> = {}) =>
    apiClient.get('/rutas', { params }).then(r => r.data),

  getRuta: (id: number) =>
    apiClient.get(`/rutas/${id}`).then(r => r.data),

  crearRuta: (data: any) =>
    apiClient.post('/rutas', data).then(r => r.data),

  actualizarRuta: (id: number, data: any) =>
    apiClient.put(`/rutas/${id}`, data).then(r => r.data),

  eliminarRuta: (id: number) =>
    apiClient.delete(`/rutas/${id}`).then(r => r.data),

  getClientesRuta: (id: number) =>
    apiClient.get(`/rutas/${id}/clientes`).then(r => r.data),

  getVehiculos: () =>
    apiClient.get('/vehiculos').then(r => r.data),

  getRepartidores: () =>
    apiClient.get('/repartidores').then(r => r.data),
}
