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

export default function PedidoForm({ onSubmit, isLoading, onCancel }: Props) {
  const [clienteId,   setClienteId]   = useState<number | ''>('')
  const [rutaId,      setRutaId]      = useState<number | ''>('')
  const [fechaEntrega,setFechaEntrega]= useState('')
  const [descuento,   setDescuento]   = useState(0)
  const [notas,       setNotas]       = useState('')
  const [lineas,      setLineas]      = useState<LineaVenta[]>([
    { producto_id: 0, nombre_producto: '', sku_producto: '', cantidad: 1, precio_unitario: 0, descuento_pct: 0 },
  ])

  const { data: clientesData } = useQuery({
    queryKey: ['clientes-list'],
    queryFn: () => apiClient.get('/clientes', { params: { activo: true, per_page: 100 } }).then(r => r.data.data),
  })

  const { data: rutasData } = useQuery({
    queryKey: ['rutas'],
    queryFn: () => apiClient.get('/rutas').then(r => r.data.data),
  })

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario * (1 - l.descuento_pct / 100), 0)
  const total    = subtotal - descuento

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteId) return
    if (lineas.some(l => !l.producto_id || l.cantidad <= 0)) return

    onSubmit({
      cliente_id:    clienteId,
      ruta_id:       rutaId || undefined,
      fecha_entrega: fechaEntrega || undefined,
      descuento:     descuento || undefined,
      notas:         notas || undefined,
      detalles:      lineas.map(l => ({
        producto_id:     l.producto_id,
        cantidad:        l.cantidad,
        precio_unitario: l.precio_unitario,
        descuento_pct:   l.descuento_pct,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Ruta</label>
          <select value={rutaId} onChange={e => setRutaId(Number(e.target.value) || '')}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Sin asignar —</option>
            {rutasData?.map((r: any) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega</label>
          <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descuento ($)</label>
          <input type="number" min="0" step="0.01" value={descuento}
            onChange={e => setDescuento(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <LineaProductoEditor lineas={lineas} onChange={setLineas} disabled={isLoading} />

      <div className="flex justify-end text-sm font-semibold">
        Total del pedido: <span className="ml-2 text-gray-900">{formatCurrency(total)}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} disabled={isLoading}
          className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading || !clienteId}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors',
            (isLoading || !clienteId) && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Guardando...' : 'Crear Pedido'}
        </button>
      </div>
    </form>
  )
}
