import apiClient from '@/api/client'

export const reportesApi = {
  getDashboard: () =>
    apiClient.get('/reportes/dashboard').then(r => r.data),

  getReporteVentas: (params: { fecha_desde?: string; fecha_hasta?: string } = {}) =>
    apiClient.get('/reportes/ventas', { params }).then(r => r.data),

  getReporteInventario: () =>
    apiClient.get('/reportes/inventario').then(r => r.data),

  getReporteCargas: (params: { fecha_desde?: string; fecha_hasta?: string } = {}) =>
    apiClient.get('/reportes/cargas', { params }).then(r => r.data),

  getReporteMermas: (params: { fecha_desde?: string; fecha_hasta?: string } = {}) =>
    apiClient.get('/reportes/mermas', { params }).then(r => r.data),

  getClientesDeuda: (params: { per_page?: number } = {}) =>
    apiClient.get('/reportes/clientes-deuda', { params }).then(r => r.data),

  getReporteEnvases: () =>
    apiClient.get('/reportes/envases').then(r => r.data),

  exportar: (tipo: string, params: Record<string, any> = {}) =>
    apiClient.post(`/reportes/exportar/${tipo}`, params, { responseType: 'blob' }).then(r => r.data),
}
