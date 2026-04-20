export interface Cliente {
  id: number
  codigo: string
  nombre: string
  rfc: string | null
  telefono: string | null
  email: string | null
  direccion: string | null
  colonia: string | null
  municipio: string | null
  estado: string | null
  cp: string | null
  activo: boolean
  credito_limite: number
  credito_dias: number
  saldo_pendiente: number
  lat: number | null
  lng: number | null
  notas: string | null
  ruta: { id: number; nombre: string } | null
  zona: { id: number; nombre: string } | null
  lista_precio: { id: number; nombre: string } | null
  created_at: string
  envases?: EnvaseBalance[]
}

export interface EnvaseBalance {
  tipo: string
  prestados: number
  devueltos: number
  saldo: number
}

export interface ClienteFilters {
  search?: string
  ruta_id?: number
  zona_id?: number
  activo?: boolean
  con_deuda?: boolean
  per_page?: number
  page?: number
}
