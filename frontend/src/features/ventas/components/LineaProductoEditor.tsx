import { useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import type { LineaVenta } from '../types/venta.types'

interface Props {
  lineas: LineaVenta[]
  onChange: (lineas: LineaVenta[]) => void
  disabled?: boolean
}

const LINEA_VACIA: LineaVenta = {
  producto_id: 0, nombre_producto: '', sku_producto: '',
  cantidad: 1, precio_unitario: 0, descuento_pct: 0,
}

export default function LineaProductoEditor({ lineas, onChange, disabled }: Props) {
  const [busqueda,    setBusqueda]    = useState('')
  const [lineaActiva, setLineaActiva] = useState<number | null>(null)

  const { data: productosData } = useQuery({
    queryKey: ['productos-search', busqueda],
    queryFn:  () => apiClient.get('/productos', { params: { search: busqueda, per_page: 10 } }).then(r => r.data),
    enabled:  busqueda.length >= 2,
  })

  const update = (i: number, field: keyof LineaVenta, val: any) =>
    onChange(lineas.map((l, idx) => idx === i ? { ...l, [field]: val } : l))

  const seleccionar = (i: number, prod: any) => {
    const precios = Object.values(prod.precios ?? {}) as any[]
    const precio  = precios[0]?.precio ?? 0
    onChange(lineas.map((l, idx) => idx === i
      ? { ...l, producto_id: prod.id, nombre_producto: prod.nombre, sku_producto: prod.codigo_sku, precio_unitario: precio }
      : l
    ))
    setLineaActiva(null)
    setBusqueda('')
  }

  const total = lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario * (1 - l.descuento_pct / 100), 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Productos</h3>
        <button type="button" disabled={disabled}
          onClick={() => onChange([...lineas, { ...LINEA_VACIA }])}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" /> Agregar línea
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-medium text-muted-foreground uppercase">
              <th className="px-3 py-2 text-left w-2/5">Producto</th>
              <th className="px-3 py-2 text-right">Cant.</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right">Desc%</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {lineas.map((l, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="px-3 py-2 relative">
                  {l.producto_id ? (
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 text-xs leading-tight">{l.nombre_producto}</p>
                        <p className="text-xs text-muted-foreground font-mono">{l.sku_producto}</p>
                      </div>
                      {!disabled && (
                        <button type="button"
                          onClick={() => update(i, 'producto_id', 0)}
                          className="text-muted-foreground hover:text-destructive p-0.5 flex-shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input type="text" placeholder="Buscar..."
                        value={lineaActiva === i ? busqueda : ''}
                        onFocus={() => setLineaActiva(i)}
                        onChange={e => setBusqueda(e.target.value)}
                        disabled={disabled}
                        className="w-full pl-7 pr-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                      {lineaActiva === i && productosData?.data?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto mt-0.5">
                          {productosData.data.map((p: any) => (
                            <button key={p.id} type="button"
                              onClick={() => seleccionar(i, p)}
                              className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 border-b last:border-0">
                              <p className="font-medium">{p.nombre}</p>
                              <p className="text-muted-foreground font-mono">{p.codigo_sku}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2">
                  <input type="number" min="0.001" step="0.001" value={l.cantidad} disabled={disabled}
                    onChange={e => update(i, 'cantidad', Number(e.target.value))}
                    className="w-20 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-50" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" min="0" step="0.01" value={l.precio_unitario} disabled={disabled}
                    onChange={e => update(i, 'precio_unitario', Number(e.target.value))}
                    className="w-24 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-50" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" min="0" max="100" step="0.01" value={l.descuento_pct} disabled={disabled}
                    onChange={e => update(i, 'descuento_pct', Number(e.target.value))}
                    className="w-16 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-50" />
                </td>
                <td className="px-3 py-2 text-right text-xs font-medium whitespace-nowrap">
                  {formatCurrency(l.cantidad * l.precio_unitario * (1 - l.descuento_pct / 100))}
                </td>
                <td className="px-2 py-2">
                  {!disabled && lineas.length > 1 && (
                    <button type="button" onClick={() => onChange(lineas.filter((_, idx) => idx !== i))}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end text-sm font-semibold">
        Subtotal: <span className="ml-2 text-gray-900">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}
