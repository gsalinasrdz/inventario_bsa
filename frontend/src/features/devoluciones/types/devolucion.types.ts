export type EstadoDevolucion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'

export interface DetalleDevolucion {
  id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad: number
  precio_unitario: number
  subtotal: number
}

export interface Devolucion {
  id: number
  folio: string
  estado: EstadoDevolucion
  fecha_devolucion: string
  cliente: string | null
  almacen: string | null
  motivo: string | null
  notas: string | null
  detalles_count: number
  detalles?: DetalleDevolucion[]
}

export interface DevolucionFilters {
  estado?: string
  cliente_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}
