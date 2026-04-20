import apiClient from '@/api/client'
import type { StockFilters, MovimientoFilters } from '../types/inventario.types'

export const inventarioApi = {
  getStock: (filters: StockFilters = {}) =>
    apiClient.get('/inventario/stock', { params: filters }).then(r => r.data),

  getStockProducto: (productoId: number) =>
    apiClient.get(`/inventario/stock/${productoId}`).then(r => r.data),

  getResumen: () =>
    apiClient.get('/inventario/stock/resumen').then(r => r.data),

  getMovimientos: (filters: MovimientoFilters = {}) =>
    apiClient.get('/inventario/movimientos', { params: filters }).then(r => r.data),

  getKardex: (productoId: number, filters: Omit<MovimientoFilters, 'producto_id'> = {}) =>
    apiClient.get(`/inventario/kardex/${productoId}`, { params: filters }).then(r => r.data),
}
