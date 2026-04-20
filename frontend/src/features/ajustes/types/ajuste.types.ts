export type EstadoAjuste = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'
export type TipoAjuste  = 'ENTRADA' | 'SALIDA'

export interface DetalleAjuste {
  id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad: number
}

export interface AjusteInventario {
  id: number
  folio: string
  estado: EstadoAjuste
  fecha_ajuste: string
  tipo: TipoAjuste
  almacen: string | null
  motivo: string
  notas: string | null
  detalles_count: number
  detalles?: DetalleAjuste[]
}

export interface AjusteFilters {
  estado?: string
  tipo?: string
  almacen_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}
