import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrdenCompra, DetalleRecepcionForm } from '../types/compra.types'

interface Props {
  orden?: OrdenCompra
  onSubmit: (data: any) => void
  isLoading?: boolean
  onCancel: () => void
}

export default function RecepcionForm({ orden, onSubmit, isLoading, onCancel }: Props) {
  const proveedor = orden?.proveedor ?? null
  const [proveedorId] = useState(proveedor?.id ?? 0)

  const lineasInicialesDeOrden = (): DetalleRecepcionForm[] =>
    orden?.detalles
      ?.filter(d => d.pendiente > 0)
      .map(d => ({
        producto_id:     d.producto_id,
        nombre_producto: d.producto?.nombre ?? '',
        sku_producto:    d.producto?.sku ?? '',
        detalle_orden_id:d.id,
        cantidad:        d.pendiente,
        precio_unitario: d.precio_unitario,
        lote:            '',
        fecha_vencimiento: '',
      })) ?? []

  const [almacenId,        setAlmacenId]        = useState<string>('')
  const [fechaRecepcion,   setFechaRecepcion]   = useState(new Date().toISOString().split('T')[0])
  const [referencia,       setReferencia]       = useState('')
  const [notas,            setNotas]            = useState('')
  const [detalles,         setDetalles]         = useState<DetalleRecepcionForm[]>(
    orden ? lineasInicialesDeOrden() : [{ producto_id: 0, nombre_producto: '', sku_producto: '', cantidad: 1, precio_unitario: 0, lote: '', fecha_vencimiento: '' }]
  )

  const updateLinea = (i: number, field: keyof DetalleRecepcionForm, value: any) =>
    setDetalles(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))

  const eliminarLinea = (i: number) =>
    setDetalles(prev => prev.filter((_, idx) => idx !== i))

  const total = detalles.reduce((s, d) => s + d.cantidad * d.precio_unitario, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!almacenId) return

    onSubmit({
      proveedor_id:         orden?.proveedor?.id ?? proveedorId,
      almacen_id:           Number(almacenId),
      fecha_recepcion:      fechaRecepcion,
      referencia_proveedor: referencia || undefined,
      notas:                notas || undefined,
      detalles:             detalles.map(d => ({
        producto_id:       d.producto_id,
        detalle_orden_id:  d.detalle_orden_id,
        cantidad:          d.cantidad,
        precio_unitario:   d.precio_unitario,
        lote:              d.lote || undefined,
        fecha_vencimiento: d.fecha_vencimiento || undefined,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Encabezado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {orden && (
          <div className="sm:col-span-2 bg-blue-50 rounded-lg p-3 text-sm">
            <span className="font-medium text-blue-800">Orden: </span>
            <span className="text-blue-700">{orden.folio}</span>
            {proveedor && (
              <span className="text-blue-600 ml-3">— {proveedor.nombre}</span>
            )}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Almacén <span className="text-destructive">*</span>
          </label>
          <input type="number" placeholder="ID del almacén" value={almacenId}
            onChange={e => setAlmacenId(e.target.value)} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de recepción <span className="text-destructive">*</span>
          </label>
          <input type="date" value={fechaRecepcion} onChange={e => setFechaRecepcion(e.target.value)} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referencia proveedor</label>
          <input type="text" placeholder="Factura / Remisión" value={referencia}
            onChange={e => setReferencia(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {/* Detalles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Productos recibidos</h3>
          {!orden && (
            <button type="button"
              onClick={() => setDetalles(p => [...p, { producto_id: 0, nombre_producto: '', sku_producto: '', cantidad: 1, precio_unitario: 0, lote: '', fecha_vencimiento: '' }])}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Agregar
            </button>
          )}
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-medium text-muted-foreground uppercase">
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-right">Cant.</th>
                <th className="px-3 py-2 text-right">Precio Unit.</th>
                <th className="px-3 py-2 text-left">Lote</th>
                <th className="px-3 py-2 text-left">Vence</th>
                <th className="px-2 py-2 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {detalles.map((d, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    {d.producto_id ? (
                      <div>
                        <p className="font-medium text-gray-900 text-xs">{d.nombre_producto}</p>
                        <p className="text-xs text-muted-foreground font-mono">{d.sku_producto}</p>
                      </div>
                    ) : (
                      <input type="number" placeholder="ID producto" value={d.producto_id || ''}
                        onChange={e => updateLinea(i, 'producto_id', Number(e.target.value))}
                        className="w-24 px-2 py-1 border border-input rounded text-xs focus:outline-none" />
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0.001" step="0.001" value={d.cantidad}
                      onChange={e => updateLinea(i, 'cantidad', Number(e.target.value))}
                      className="w-20 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" step="0.0001" value={d.precio_unitario}
                      onChange={e => updateLinea(i, 'precio_unitario', Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="text" placeholder="Opcional" value={d.lote}
                      onChange={e => updateLinea(i, 'lote', e.target.value)}
                      className="w-24 px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="date" value={d.fecha_vencimiento}
                      onChange={e => updateLinea(i, 'fecha_vencimiento', e.target.value)}
                      className="w-28 px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
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

      {/* Total */}
      <div className="flex justify-end">
        <div className="text-sm font-semibold">
          Total recepción: <span className="text-gray-900 ml-2">{formatCurrency(total)}</span>
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
        <button type="submit" disabled={isLoading || !almacenId}
          className={cn(
            'px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors',
            (isLoading || !almacenId) && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Procesando...' : 'Registrar Recepción'}
        </button>
      </div>
    </form>
  )
}
