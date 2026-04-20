import apiClient from '@/api/client'

export const flotaApi = {
  getVehiculos: () =>
    apiClient.get('/vehiculos').then(r => r.data),

  getVehiculo: (id: number) =>
    apiClient.get(`/vehiculos/${id}`).then(r => r.data),

  crearVehiculo: (data: any) =>
    apiClient.post('/vehiculos', data).then(r => r.data),

  actualizarVehiculo: (id: number, data: any) =>
    apiClient.put(`/vehiculos/${id}`, data).then(r => r.data),

  eliminarVehiculo: (id: number) =>
    apiClient.delete(`/vehiculos/${id}`).then(r => r.data),
}
