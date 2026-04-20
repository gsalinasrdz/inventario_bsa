import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Search } from 'lucide-react'
import apiClient from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DetalleOrdenForm } from '../types/compra.types'

interface Props {
  onSubmit: (data: any) => void
  isLoading?: boolean
  onCancel: () => void
}

const DETALLE_VACIO: DetalleOrdenForm = {
  producto_id: 0,
  nombre_producto: '',
  sku_producto: '',
  cantidad_solicitada: 1,
  precio_unitario: 0,
  descuento_pct: 0,
}

export default function OrdenCompraForm({ onSubmit, isLoading, onCancel }: Props) {
  const [proveedorId,    setProveedorId]    = useState<number | ''>('')
  const [almacenId,      setAlmacenId]      = useState<number | ''>('')
  const [fechaEsperada,  setFechaEsperada]  = useState('')
  const [descuento,      setDescuento]      = useState(0)
  const [notas,          setNotas]          = useState('')
  const [detalles,       setDetalles]       = useState<DetalleOrdenForm[]>([{ ...DETALLE_VACIO }])
  const [busqueda,       setBusqueda]       = useState('')
  const [lineaActiva,    setLineaActiva]    = useState<number | null>(null)

  const { data: proveedoresData } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => apiClient.get('/proveedores').then(r => r.data.data),
  })

  const { data: almacenesData } = useQuery({
    queryKey: ['almacenes'],
    queryFn: () => apiClient.get('/almacenes').then(r => r.data.data),
  })

  const { data: productosData } = useQuery({
    queryKey: ['productos-search', busqueda],
    queryFn: () => apiClient.get('/productos', { params: { search: busqueda, per_page: 10 } }).then(r => r.data),
    enabled: busqueda.length >= 2,
  })

  const agregarLinea = () => setDetalles(prev => [...prev, { ...DETALLE_VACIO }])

  const eliminarLinea = (i: number) =>
    setDetalles(prev => prev.filter((_, idx) => idx !== i))

  const updateLinea = (i: number, field: keyof DetalleOrdenForm, value: any) =>
    setDetalles(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))

  const seleccionarProducto = (i: number, prod: any) => {
    updateLinea(i, 'producto_id', prod.id)
    updateLinea(i, 'nombre_producto', prod.nombre)
    updateLinea(i, 'sku_producto', prod.codigo_sku)
    setLineaActiva(null)
    setBusqueda('')
  }

  const subtotal = detalles.reduce((sum, d) => {
    return sum + d.cantidad_solicitada * d.precio_unitario * (1 - d.descuento_pct / 100)
  }, 0)
  const iva   = subtotal * 0.16
  const total = subtotal - descuento + iva

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!proveedorId || !almacenId) return
    if (detalles.some(d => !d.producto_id || d.cantidad_solicitada <= 0)) return

    onSubmit({
      proveedor_id:   proveedorId,
      almacen_id:     almacenId,
      fecha_esperada: fechaEsperada || undefined,
      descuento,
      notas:          notas || undefined,
      detalles:       detalles.map(d => ({
        producto_id:          d.producto_id,
        cantidad_solicitada:  d.cantidad_solicitada,
        precio_unitario:      d.precio_unitario,
        descuento_pct:        d.descuento_pct,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Encabezado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor <span className="text-destructive">*</span>
          </label>
          <select value={proveedorId} onChange={e => setProveedorId(Number(e.target.value) || '')}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            required>
            <option value="">— Seleccionar —</option>
            {proveedoresData?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.razon_social}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Almacén destino <span className="text-destructive">*</span>
          </label>
          <select value={almacenId} onChange={e => setAlmacenId(Number(e.target.value) || '')}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            required>
            <option value="">— Seleccionar —</option>
            {almacenesData?.map((a: any) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha esperada</label>
          <input type="date" value={fechaEsperada} onChange={e => setFechaEsperada(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descuento global ($)</label>
          <input type="number" min="0" step="0.01" value={descuento}
            onChange={e => setDescuento(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {/* Detalles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Productos</h3>
          <button type="button" onClick={agregarLinea}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar línea
          </button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-medium text-muted-foreground uppercase">
                <th className="px-3 py-2 text-left w-2/5">Producto</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
                <th className="px-3 py-2 text-right">Precio Unit.</th>
                <th className="px-3 py-2 text-right">Desc %</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {detalles.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2 relative">
                    {d.producto_id ? (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{d.nombre_producto}</p>
                          <p className="text-xs text-muted-foreground font-mono">{d.sku_producto}</p>
                        </div>
                        <button type="button" onClick={() => { updateLinea(i, 'producto_id', 0); updateLinea(i, 'nombre_producto', '') }}
                          className="text-muted-foreground hover:text-destructive p-0.5">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar producto..."
                          value={lineaActiva === i ? busqueda : ''}
                          onFocus={() => setLineaActiva(i)}
                          onChange={e => setBusqueda(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        {lineaActiva === i && productosData?.data?.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-10 bg-white border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto mt-0.5">
                            {productosData.data.map((p: any) => (
                              <button key={p.id} type="button"
                                onClick={() => seleccionarProducto(i, p)}
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
                    <input type="number" min="0.001" step="0.001" value={d.cantidad_solicitada}
                      onChange={e => updateLinea(i, 'cantidad_solicitada', Number(e.target.value))}
                      className="w-20 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" step="0.0001" value={d.precio_unitario}
                      onChange={e => updateLinea(i, 'precio_unitario', Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" max="100" step="0.01" value={d.descuento_pct}
                      onChange={e => updateLinea(i, 'descuento_pct', Number(e.target.value))}
                      className="w-16 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium">
                    {formatCurrency(d.cantidad_solicitada * d.precio_unitario * (1 - d.descuento_pct / 100))}
                  </td>
                  <td className="px-2 py-2">
                    {detalles.length > 1 && (
                      <button type="button" onClick={() => eliminarLinea(i)}
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
      </div>

      {/* Totales */}
      <div className="flex justify-end">
        <div className="space-y-1 text-sm min-w-[220px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Descuento:</span>
              <span>−{formatCurrency(descuento)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>IVA (16%):</span>
            <span>{formatCurrency(iva)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} disabled={isLoading}
          className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading || !proveedorId || !almacenId}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors',
            (isLoading || !proveedorId || !almacenId) && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Guardando...' : 'Crear Orden de Compra'}
        </button>
      </div>
    </form>
  )
}
