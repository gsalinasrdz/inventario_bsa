export type EstadoMerma = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
export type TipoMerma  = 'VENCIMIENTO' | 'DAÑO' | 'ROBO' | 'OTRO'

export interface DetalleMerma {
  id: number
  producto: { id: number; nombre: string; sku: string } | null
  cantidad: number
  motivo: string | null
}

export interface Merma {
  id: number
  folio: string
  estado: EstadoMerma
  fecha_merma: string
  tipo_merma: TipoMerma
  almacen: string | null
  notas: string | null
  detalles_count: number
  detalles?: DetalleMerma[]
}

export interface MermaFilters {
  estado?: string
  tipo_merma?: string
  almacen_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  page?: number
  per_page?: number
}
