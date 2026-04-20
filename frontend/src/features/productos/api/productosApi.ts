import apiClient from '@/api/client'
import { ENDPOINTS } from '@/api/endpoints'
import type { Producto, ProductoFormData } from '../types/producto.types'
import type { ApiResponse, PaginatedResponse } from '@/types/common'

export interface ProductoFilters {
  search?:      string
  categoria_id?: number
  estado?:      string
  stock_bajo?:  boolean
  page?:        number
  per_page?:    number
  sort_by?:     string
  sort_dir?:    'asc' | 'desc'
}

export const productosApi = {
  async getAll(filters: ProductoFilters = {}): Promise<PaginatedResponse<Producto>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== '')
    )
    const res = await apiClient.get(ENDPOINTS.PRODUCTOS, { params })
    return { data: res.data.data, meta: res.data.meta }
  },

  async getOne(id: number): Promise<Producto> {
    const res = await apiClient.get(`${ENDPOINTS.PRODUCTOS}/${id}`)
    return res.data.data
  },

  async create(data: ProductoFormData): Promise<Producto> {
    const res = await apiClient.post<ApiResponse<Producto>>(ENDPOINTS.PRODUCTOS, data)
    return res.data.data
  },

  async update(id: number, data: Partial<ProductoFormData>): Promise<Producto> {
    const res = await apiClient.put<ApiResponse<Producto>>(`${ENDPOINTS.PRODUCTOS}/${id}`, data)
    return res.data.data
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.PRODUCTOS}/${id}`)
  },

  async stockBajo(): Promise<Producto[]> {
    const res = await apiClient.get(ENDPOINTS.STOCK_BAJO)
    return res.data.data
  },

  async uploadImagen(productoId: number, file: File): Promise<{ id: number; url: string }> {
    const formData = new FormData()
    formData.append('imagen', file)
    const res = await apiClient.post(
      `${ENDPOINTS.PRODUCTOS}/${productoId}/imagenes`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return res.data.data
  },

  async deleteImagen(productoId: number, imagenId: number): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.PRODUCTOS}/${productoId}/imagenes/${imagenId}`)
  },

  async updatePrecios(productoId: number, precios: Record<number, number>): Promise<void> {
    await apiClient.put(`${ENDPOINTS.PRODUCTOS}/${productoId}/precios`, { precios })
  },
}
