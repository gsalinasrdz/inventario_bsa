import { Pencil, Trash2, Image } from 'lucide-react'
import type { Producto } from '../types/producto.types'
import StockBadge from './StockBadge'
import { usePermissions } from '@/hooks/usePermissions'

interface Props {
  productos:  Producto[]
  isLoading:  boolean
  onEdit:     (p: Producto) => void
  onDelete:   (p: Producto) => void
  onImagen?:  (p: Producto) => void
}

export default function ProductoTable({ productos, isLoading, onEdit, onDelete }: Props) {
  const { can } = usePermissions()

  if (isLoading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (!productos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Sin productos</p>
        <p className="text-sm">Agregue el primer producto con el botón de arriba.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <th className="px-4 py-3">Producto</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3">Categoría</th>
            <th className="px-4 py-3">Presentación</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-right">Estado</th>
            {(can('productos.editar') || can('productos.eliminar')) && (
              <th className="px-4 py-3 text-right">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {productos.map((producto) => (
            <tr key={producto.id} className="hover:bg-gray-50/50 transition-colors">
              {/* Imagen + nombre */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      className="w-9 h-9 rounded object-cover bg-gray-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Image className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 leading-none">{producto.nombre}</p>
                    {producto.marca && (
                      <p className="text-xs text-muted-foreground mt-0.5">{producto.marca.nombre}</p>
                    )}
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                {producto.codigo_sku}
              </td>

              <td className="px-4 py-3 text-muted-foreground">
                {producto.categoria?.nombre ?? '—'}
              </td>

              <td className="px-4 py-3 text-muted-foreground">
                {producto.presentacion?.nombre ?? '—'}
              </td>

              <td className="px-4 py-3 text-right">
                <StockBadge
                  stockActual={producto.stock_total}
                  stockMinimo={Number(producto.stock_minimo)}
                />
              </td>

              <td className="px-4 py-3 text-right">
                <span className={`text-xs font-medium ${
                  producto.estado === 'ACTIVO'        ? 'text-green-600' :
                  producto.estado === 'DESCONTINUADO' ? 'text-red-500'   : 'text-gray-400'
                }`}>
                  {producto.estado}
                </span>
              </td>

              {(can('productos.editar') || can('productos.eliminar')) && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {can('productos.editar') && (
                      <button
                        onClick={() => onEdit(producto)}
                        className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    {can('productos.eliminar') && (
                      <button
                        onClick={() => onDelete(producto)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
