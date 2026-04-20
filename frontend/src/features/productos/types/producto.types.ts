export type EstadoProducto = 'ACTIVO' | 'INACTIVO' | 'DESCONTINUADO'

export interface Categoria   { id: number; nombre: string }
export interface Marca       { id: number; nombre: string }
export interface Presentacion { id: number; nombre: string; unidades: number }
export interface Proveedor   { id: number; razon_social: string }
export interface ListaPrecio { id: number; nombre: string }

export interface Precio {
  lista:  string
  precio: number
}

export interface Producto {
  id:             number
  codigo_sku:     string
  codigo_barras:  string | null
  nombre:         string
  descripcion:    string | null
  estado:         EstadoProducto
  es_retornable:  boolean
  peso_kg:        number | null
  stock_minimo:   number
  stock_maximo:   number | null
  stock_total:    number | null
  imagen_url:     string | null
  categoria:      Categoria | null
  marca:          Marca | null
  presentacion:   Presentacion | null
  proveedor:      Proveedor | null
  precios:        Record<string, Precio>
  created_at:     string
  updated_at:     string
}

export interface ProductoFormData {
  codigo_sku:      string
  codigo_barras?:  string
  nombre:          string
  descripcion?:    string
  categoria_id:    number
  marca_id:        number
  presentacion_id: number
  tipo_envase_id?: number
  proveedor_id?:   number
  es_retornable:   boolean
  stock_minimo:    number
  stock_maximo?:   number
  estado:          EstadoProducto
  precios?:        Record<number, number>
}
