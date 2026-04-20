import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, XCircle, Receipt } from 'lucide-react'
import { useVenta, useCancelarVenta } from '../hooks/useVentas'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ESTADO_CFG = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  COBRADA:   { label: 'Cobrada',   color: 'bg-green-100 text-green-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
}

export default function VentaDetailPage() {
  const { ventaId } = useParams<{ ventaId: string }>()
  const id = Number(ventaId)
  const { can } = usePermissions()

  const [cancelDialog, setCancelDialog] = useState(false)

  const { data, isLoading } = useVenta(id)
  const cancelarMutation = useCancelarVenta()

  const venta = data?.data

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!venta) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Venta no encontrada</p>
        <Link to="/ventas" className="mt-2 text-sm text-primary hover:underline">Volver</Link>
      </div>
    )
  }

  const cfg = ESTADO_CFG[venta.estado as keyof typeof ESTADO_CFG] ?? ESTADO_CFG.PENDIENTE

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/ventas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{venta.folio}</h1>
          <p className="text-sm text-muted-foreground">{venta.cliente?.nombre}</p>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1 rounded-full', cfg.color)}>{cfg.label}</span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Tipo de pago</p>
          <p className="font-semibold text-gray-900 mt-1 capitalize">{venta.tipo_pago.toLowerCase()}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Fecha</p>
          <p className="font-semibold text-gray-900 mt-1">{formatDate(venta.fecha_venta)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Almacén</p>
          <p className="font-semibold text-gray-900 mt-1">{venta.almacen ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Vendedor</p>
          <p className="font-semibold text-gray-900 mt-1">{venta.usuario ?? '—'}</p>
        </div>
      </div>

      {/* Acciones */}
      {can('ventas.cancelar') && venta.estado !== 'CANCELADA' && (
        <div className="flex gap-2">
          <button onClick={() => setCancelDialog(true)}
            className="flex items-center gap-2 px-4 py-2 border border-destructive/40 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors">
            <XCircle className="w-4 h-4" />
            Cancelar Venta
          </button>
        </div>
      )}

      {/* Detalles */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-gray-900 text-sm">Detalle de productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3 text-right">Precio Unit.</th>
                <th className="px-4 py-3 text-right">Desc%</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {venta.detalles?.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.producto?.nombre ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.producto?.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{d.cantidad}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(d.precio_unitario)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{d.descuento_pct}%</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-gray-50">
                <td colSpan={3} className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  <div>Subtotal</div>
                  {venta.descuento > 0 && <div>Descuento</div>}
                  <div>IVA (16%)</div>
                  <div className="font-semibold text-gray-900 mt-1">Total</div>
                  {venta.saldo > 0 && <div className="text-red-600">Saldo pendiente</div>}
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div>{formatCurrency(venta.subtotal)}</div>
                  {venta.descuento > 0 && <div>−{formatCurrency(venta.descuento)}</div>}
                  <div>{formatCurrency(venta.iva)}</div>
                  <div className="font-semibold text-gray-900 mt-1">{formatCurrency(venta.total)}</div>
                  {venta.saldo > 0 && <div className="text-red-600 font-semibold">{formatCurrency(venta.saldo)}</div>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {venta.notas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Notas</p>
          <p>{venta.notas}</p>
        </div>
      )}

      <ConfirmDialog
        open={cancelDialog}
        title="Cancelar Venta"
        description={`¿Cancelar "${venta.folio}"? El stock será revertido automáticamente.`}
        confirmLabel="Sí, cancelar"
        variant="warning"
        isLoading={cancelarMutation.isPending}
        onConfirm={async () => { await cancelarMutation.mutateAsync({ id }); setCancelDialog(false) }}
        onCancel={() => setCancelDialog(false)}
      />
    </div>
  )
}
