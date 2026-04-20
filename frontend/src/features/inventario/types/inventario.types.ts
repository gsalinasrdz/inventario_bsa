export interface StockItem {
  id: number
  codigo_sku: string
  nombre: string
  categoria: string | null
  marca: string | null
  presentacion: string | null
  stock_total: number
  reservado_total: number
  disponible: number
  stock_minimo: number
  stock_maximo: number | null
  estado_stock: 'NORMAL' | 'BAJO' | 'AGOTADO' | 'EXCESO'
  estado: 'ACTIVO' | 'INACTIVO' | 'DESCONTINUADO'
}

export interface StockDetalle extends StockItem {
  por_almacen: {
    almacen_id: number
    almacen: string
    cantidad: number
    reservada: number
    disponible: number
  }[]
}

export interface Movimiento {
  id: number
  tipo: string
  cantidad: number
  costo_unit: number | null
  referencia: string | null
  notas: string | null
  producto: {
    id: number
    nombre: string
    sku: string
  }
  almacen: string | null
  usuario: string | null
  created_at: string
  saldo_acumulado?: number
}

export interface StockResumen {
  total: number
  activos: number
  stockBajo: number
  sinStock: number
}

export interface StockFilters {
  search?: string
  categoria_id?: number
  almacen_id?: number
  stock_bajo?: boolean
  per_page?: number
  page?: number
}

export interface MovimientoFilters {
  producto_id?: number
  tipo?: string
  almacen_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  per_page?: number
  page?: number
}
