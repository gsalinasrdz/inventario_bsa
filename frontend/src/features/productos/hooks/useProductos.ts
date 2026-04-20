import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productosApi, type ProductoFilters } from '../api/productosApi'
import type { ProductoFormData } from '../types/producto.types'

const KEYS = {
  all:      ['productos'] as const,
  list:     (f: ProductoFilters) => ['productos', 'list', f] as const,
  detail:   (id: number) => ['productos', 'detail', id] as const,
  stockBajo: ['productos', 'stock-bajo'] as const,
}

export function useProductos(filters: ProductoFilters = {}) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn:  () => productosApi.getAll(filters),
  })
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn:  () => productosApi.getOne(id),
    enabled:  !!id,
  })
}

export function useStockBajo() {
  return useQuery({
    queryKey: KEYS.stockBajo,
    queryFn:  productosApi.stockBajo,
    staleTime: 60 * 1000,
  })
}

export function useCrearProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProductoFormData) => productosApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Producto creado correctamente.')
    },
  })
}

export function useActualizarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductoFormData> }) =>
      productosApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      qc.invalidateQueries({ queryKey: KEYS.detail(id) })
      toast.success('Producto actualizado correctamente.')
    },
  })
}

export function useEliminarProducto() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productosApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all })
      toast.success('Producto eliminado correctamente.')
    },
  })
}
