export type EstadoOrden = 'BORRADOR' | 'ENVIADA' | 'PARCIAL' | 'COMPLETA' | 'CANCELADA'

export interface DetalleOrden {
  id: number
  producto_id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad_solicitada: number
  cantidad_recibida: number
  pendiente: number
  precio_unitario: number
  descuento_pct: number
}

export interface OrdenCompra {
  id: number
  folio: string
  estado: EstadoOrden
  proveedor: { id: number; nombre: string } | null
  almacen: string | null
  usuario: string | null
  fecha_esperada: string | null
  subtotal: number
  descuento: number
  iva: number
  total: number
  notas: string | null
  detalles_count: number
  detalles?: DetalleOrden[]
  recepciones?: RecepcionResumen[]
  created_at: string
}

export interface RecepcionResumen {
  id: number
  folio: string
  estado: string
  fecha_recepcion: string
  total: number
}

export interface DetalleRecepcion {
  id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad: number
  precio_unitario: number
  lote: string | null
  fecha_vencimiento: string | null
  subtotal: number
}

export interface Recepcion {
  id: number
  folio: string
  estado: string
  proveedor: { id: number; nombre: string } | null
  almacen: string | null
  usuario: string | null
  orden_compra: { id: number; folio: string } | null
  referencia_proveedor: string | null
  fecha_recepcion: string
  total: number
  notas: string | null
  detalles_count: number
  detalles?: DetalleRecepcion[]
  created_at: string
}

export interface OrdenCompraFilters {
  estado?: string
  proveedor_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}

export interface DetalleOrdenForm {
  producto_id: number
  nombre_producto: string
  sku_producto: string
  cantidad_solicitada: number
  precio_unitario: number
  descuento_pct: number
}

export interface DetalleRecepcionForm {
  producto_id: number
  nombre_producto: string
  sku_producto: string
  detalle_orden_id?: number
  cantidad: number
  precio_unitario: number
  lote: string
  fecha_vencimiento: string
}
