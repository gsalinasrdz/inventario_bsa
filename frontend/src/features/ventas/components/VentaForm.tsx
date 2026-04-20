import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import LineaProductoEditor from './LineaProductoEditor'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { LineaVenta } from '../types/venta.types'

interface Props {
  onSubmit: (data: any) => void
  isLoading?: boolean
  onCancel: () => void
}

export default function VentaForm({ onSubmit, isLoading, onCancel }: Props) {
  const [clienteId,    setClienteId]    = useState<number | ''>('')
  const [almacenId,    setAlmacenId]    = useState<number | ''>('')
  const [tipoPago,     setTipoPago]     = useState('CONTADO')
  const [fechaVenta,   setFechaVenta]   = useState(new Date().toISOString().split('T')[0])
  const [descuento,    setDescuento]    = useState(0)
  const [notas,        setNotas]        = useState('')
  const [lineas,       setLineas]       = useState<LineaVenta[]>([
    { producto_id: 0, nombre_producto: '', sku_producto: '', cantidad: 1, precio_unitario: 0, descuento_pct: 0 },
  ])

  const { data: clientesData } = useQuery({
    queryKey: ['clientes-list'],
    queryFn: () => apiClient.get('/clientes', { params: { activo: true, per_page: 100 } }).then(r => r.data.data),
  })

  const { data: almacenesData } = useQuery({
    queryKey: ['almacenes'],
    queryFn: () => apiClient.get('/almacenes').then(r => r.data.data),
  })

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario * (1 - l.descuento_pct / 100), 0)
  const iva      = (subtotal - descuento) * 0.16
  const total    = subtotal - descuento + iva

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteId || !almacenId) return
    if (lineas.some(l => !l.producto_id || l.cantidad <= 0)) return

    onSubmit({
      cliente_id:  clienteId,
      almacen_id:  almacenId,
      tipo_pago:   tipoPago,
      fecha_venta: fechaVenta,
      descuento:   descuento || undefined,
      notas:       notas || undefined,
      detalles:    lineas.map(l => ({
        producto_id:     l.producto_id,
        cantidad:        l.cantidad,
        precio_unitario: l.precio_unitario,
        descuento_pct:   l.descuento_pct,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Encabezado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cliente <span className="text-destructive">*</span>
          </label>
          <select value={clienteId} onChange={e => setClienteId(Number(e.target.value) || '')} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Seleccionar —</option>
            {clientesData?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.nombre} — {c.codigo}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Almacén <span className="text-destructive">*</span>
          </label>
          <select value={almacenId} onChange={e => setAlmacenId(Number(e.target.value) || '')} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Seleccionar —</option>
            {almacenesData?.map((a: any) => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de pago <span className="text-destructive">*</span>
          </label>
          <select value={tipoPago} onChange={e => setTipoPago(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="CONTADO">Contado</option>
            <option value="CREDITO">Crédito</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha <span className="text-destructive">*</span>
          </label>
          <input type="date" value={fechaVenta} onChange={e => setFechaVenta(e.target.value)} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descuento global ($)</label>
          <input type="number" min="0" step="0.01" value={descuento}
            onChange={e => setDescuento(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {/* Líneas de productos */}
      <LineaProductoEditor lineas={lineas} onChange={setLineas} disabled={isLoading} />

      {/* Totales */}
      <div className="flex justify-end">
        <div className="space-y-1 text-sm min-w-[220px]">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal:</span><span>{formatCurrency(subtotal)}</span>
          </div>
          {descuento > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Descuento:</span><span>−{formatCurrency(descuento)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>IVA (16%):</span><span>{formatCurrency(iva)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t">
            <span>Total:</span><span>{formatCurrency(total)}</span>
          </div>
          {tipoPago === 'CONTADO' && (
            <p className="text-xs text-green-600 text-right">Se registrará como pagada al contado</p>
          )}
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
        <button type="submit" disabled={isLoading || !clienteId || !almacenId}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors',
            (isLoading || !clienteId || !almacenId) && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Procesando...' : 'Registrar Venta'}
        </button>
      </div>
    </form>
  )
}
