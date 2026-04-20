export type EstadoVenta   = 'PENDIENTE' | 'COBRADA' | 'CANCELADA'
export type TipoPago      = 'CONTADO' | 'CREDITO' | 'TRANSFERENCIA' | 'CHEQUE'
export type EstadoPedido  = 'PENDIENTE' | 'CONFIRMADO' | 'EN_RUTA' | 'ENTREGADO' | 'CANCELADO'

export interface DetalleVenta {
  id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad: number
  precio_unitario: number
  descuento_pct: number
  subtotal: number
}

export interface Venta {
  id: number
  folio: string
  estado: EstadoVenta
  tipo_pago: TipoPago
  cliente: { id: number; nombre: string; codigo: string } | null
  almacen: string | null
  usuario: string | null
  fecha_venta: string
  fecha_vencimiento: string | null
  subtotal: number
  descuento: number
  iva: number
  total: number
  pagado: number
  saldo: number
  notas: string | null
  detalles_count: number
  detalles?: DetalleVenta[]
  created_at: string
}

export interface DetallePedido {
  id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad: number
  precio_unitario: number
  descuento_pct: number
  subtotal: number
}

export interface Pedido {
  id: number
  folio: string
  estado: EstadoPedido
  cliente: { id: number; nombre: string; codigo: string } | null
  ruta: string | null
  usuario: string | null
  fecha_entrega: string | null
  subtotal: number
  descuento: number
  total: number
  notas: string | null
  detalles_count: number
  detalles?: DetallePedido[]
  ventas?: { id: number; folio: string; total: number }[]
  created_at: string
}

export interface VentaFilters {
  cliente_id?: number
  estado?: string
  tipo_pago?: string
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}

export interface PedidoFilters {
  cliente_id?: number
  estado?: string
  ruta_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}

export interface LineaVenta {
  producto_id: number
  nombre_producto: string
  sku_producto: string
  cantidad: number
  precio_unitario: number
  descuento_pct: number
}
