import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, XCircle, CheckCircle, ShoppingCart, Receipt } from 'lucide-react'
import { usePedido, useConfirmarPedido, useCancelarPedido, useConvertirVenta } from '../hooks/useVentas'
import VentaForm from '../components/VentaForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ESTADO_CFG = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700' },
  EN_RUTA:    { label: 'En ruta',    color: 'bg-purple-100 text-purple-700' },
  ENTREGADO:  { label: 'Entregado',  color: 'bg-green-100 text-green-700' },
  CANCELADO:  { label: 'Cancelado',  color: 'bg-red-100 text-red-600' },
}

export default function PedidoDetailPage() {
  const { pedidoId } = useParams<{ pedidoId: string }>()
  const id = Number(pedidoId)
  const { can } = usePermissions()
  const navigate = useNavigate()

  const [confirmDialog,  setConfirmDialog]  = useState(false)
  const [cancelDialog,   setCancelDialog]   = useState(false)
  const [convertirModal, setConvertirModal] = useState(false)

  const { data, isLoading } = usePedido(id)
  const confirmarMutation = useConfirmarPedido()
  const cancelarMutation  = useCancelarPedido()
  const convertirMutation = useConvertirVenta()

  const pedido = data?.data

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Pedido no encontrado</p>
        <Link to="/pedidos" className="mt-2 text-sm text-primary hover:underline">Volver</Link>
      </div>
    )
  }

  const cfg = ESTADO_CFG[pedido.estado as keyof typeof ESTADO_CFG] ?? ESTADO_CFG.PENDIENTE
  const canConfirm  = can('ventas.crear') && pedido.estado === 'PENDIENTE'
  const canCancel   = can('ventas.cancelar') && !['CANCELADO', 'ENTREGADO'].includes(pedido.estado)
  const canConvertir = can('ventas.crear') && ['CONFIRMADO', 'EN_RUTA'].includes(pedido.estado)

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/pedidos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{pedido.folio}</h1>
          <p className="text-sm text-muted-foreground">{pedido.cliente?.nombre}</p>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1 rounded-full', cfg.color)}>{cfg.label}</span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Ruta</p>
          <p className="font-semibold text-gray-900 mt-1">{pedido.ruta ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Fecha de entrega</p>
          <p className="font-semibold text-gray-900 mt-1">
            {pedido.fecha_entrega ? formatDate(pedido.fecha_entrega) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Vendedor</p>
          <p className="font-semibold text-gray-900 mt-1">{pedido.usuario ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold text-gray-900 mt-1">{formatCurrency(pedido.total)}</p>
        </div>
      </div>

      {/* Acciones */}
      {(canConfirm || canCancel || canConvertir) && (
        <div className="flex flex-wrap gap-2">
          {canConfirm && (
            <button onClick={() => setConfirmDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-600 rounded-lg text-sm hover:bg-blue-50 transition-colors">
              <CheckCircle className="w-4 h-4" />
              Confirmar Pedido
            </button>
          )}
          {canConvertir && (
            <button onClick={() => setConvertirModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Convertir a Venta
            </button>
          )}
          {canCancel && (
            <button onClick={() => setCancelDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-destructive/40 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors">
              <XCircle className="w-4 h-4" />
              Cancelar Pedido
            </button>
          )}
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
              {pedido.detalles?.map((d: any) => (
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
                  {pedido.descuento > 0 && <div>Descuento</div>}
                  <div className="font-semibold text-gray-900 mt-1">Total</div>
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div>{formatCurrency(pedido.subtotal)}</div>
                  {pedido.descuento > 0 && <div>−{formatCurrency(pedido.descuento)}</div>}
                  <div className="font-semibold text-gray-900 mt-1">{formatCurrency(pedido.total)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Ventas relacionadas */}
      {pedido.ventas && pedido.ventas.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900 text-sm">Ventas generadas</h2>
          </div>
          <div className="divide-y">
            {pedido.ventas.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link to={`/ventas/${v.id}`} className="font-mono font-medium text-primary hover:underline">
                  {v.folio}
                </Link>
                <span className="font-medium">{formatCurrency(v.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pedido.notas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Notas</p>
          <p>{pedido.notas}</p>
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog}
        title="Confirmar Pedido"
        description={`¿Confirmar el pedido "${pedido.folio}"?`}
        confirmLabel="Sí, confirmar"
        isLoading={confirmarMutation.isPending}
        onConfirm={async () => { await confirmarMutation.mutateAsync(id); setConfirmDialog(false) }}
        onCancel={() => setConfirmDialog(false)}
      />

      <ConfirmDialog
        open={cancelDialog}
        title="Cancelar Pedido"
        description={`¿Cancelar el pedido "${pedido.folio}"?`}
        confirmLabel="Sí, cancelar"
        variant="warning"
        isLoading={cancelarMutation.isPending}
        onConfirm={async () => { await cancelarMutation.mutateAsync(id); setCancelDialog(false) }}
        onCancel={() => setCancelDialog(false)}
      />

      {/* Modal convertir a venta */}
      {convertirModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConvertirModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Convertir a Venta — {pedido.folio}</h2>
            </div>
            <div className="p-6">
              <VentaForm
                onSubmit={async (data) => {
                  await convertirMutation.mutateAsync({ id, data })
                  setConvertirModal(false)
                  navigate('/ventas')
                }}
                isLoading={convertirMutation.isPending}
                onCancel={() => setConvertirModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
