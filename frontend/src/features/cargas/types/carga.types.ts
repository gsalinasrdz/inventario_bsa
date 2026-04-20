export type EstadoCarga = 'PREPARACION' | 'EN_RUTA' | 'LIQUIDADA' | 'CANCELADA'

export interface DetalleCarga {
  id: number
  producto_id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad_cargada: number
  cantidad_vendida: number
  cantidad_devuelta: number
  pendiente: number
  precio_unitario: number
}

export interface Liquidacion {
  id: number
  folio: string
  fecha_liquidacion: string
  efectivo_esperado: number
  efectivo_recibido: number
  diferencia: number
  notas: string | null
  usuario: string | null
}

export interface Carga {
  id: number
  folio: string
  estado: EstadoCarga
  fecha_carga: string
  ruta: string | null
  vehiculo: string | null
  repartidor: string | null
  almacen: string | null
  notas: string | null
  detalles_count: number
  detalles?: DetalleCarga[]
  liquidacion?: Liquidacion | null
}

export interface CargaFilters {
  estado?: string
  ruta_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}

export interface LineaCarga {
  producto_id: number
  nombre_producto: string
  sku_producto: string
  cantidad: number
  precio_unitario: number
}
