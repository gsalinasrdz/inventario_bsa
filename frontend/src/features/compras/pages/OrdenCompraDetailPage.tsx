import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react'
import { useOrden, useAprobarOrden, useCrearRecepcion } from '../hooks/useCompras'
import RecepcionForm from '../components/RecepcionForm'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ESTADO_CONFIG: Record<string, { label: string; color: string; icon?: any }> = {
  BORRADOR:  { label: 'Borrador',  color: 'bg-gray-100 text-gray-600' },
  ENVIADA:   { label: 'Enviada',   color: 'bg-blue-100 text-blue-700' },
  PARCIAL:   { label: 'Parcial',   color: 'bg-yellow-100 text-yellow-700' },
  COMPLETA:  { label: 'Completa',  color: 'bg-green-100 text-green-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
}

export default function OrdenCompraDetailPage() {
  const { ordenId } = useParams<{ ordenId: string }>()
  const id = Number(ordenId)
  const { can } = usePermissions()

  const [recepcionModal, setRecepcionModal] = useState(false)

  const { data, isLoading, refetch } = useOrden(id)
  const aprobarMutation  = useAprobarOrden()
  const recepcionMutation = useCrearRecepcion()

  const orden = data?.data

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Orden no encontrada</p>
        <Link to="/compras" className="mt-2 text-sm text-primary hover:underline">Volver</Link>
      </div>
    )
  }

  const cfg = ESTADO_CONFIG[orden.estado] ?? ESTADO_CONFIG.BORRADOR
  const puedeRecibir = ['ENVIADA', 'PARCIAL'].includes(orden.estado)

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/compras" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{orden.folio}</h1>
          <p className="text-sm text-muted-foreground">{orden.proveedor?.nombre}</p>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1 rounded-full', cfg.color)}>
          {cfg.label}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Almacén</p>
          <p className="font-semibold text-gray-900 mt-1">{orden.almacen ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Fecha esperada</p>
          <p className="font-semibold text-gray-900 mt-1">
            {orden.fecha_esperada ? formatDate(orden.fecha_esperada) : '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold text-gray-900 mt-1">{formatCurrency(orden.total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Creado por</p>
          <p className="font-semibold text-gray-900 mt-1">{orden.usuario ?? '—'}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        {can('compras.aprobar') && orden.estado === 'BORRADOR' && (
          <button onClick={() => aprobarMutation.mutateAsync(id).then(() => refetch())}
            disabled={aprobarMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70">
            <CheckCircle className="w-4 h-4" />
            Enviar al Proveedor
          </button>
        )}
        {can('compras.recibir') && puedeRecibir && (
          <button onClick={() => setRecepcionModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Truck className="w-4 h-4" />
            Registrar Recepción
          </button>
        )}
      </div>

      {/* Detalles de la OC */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-gray-900 text-sm">Productos solicitados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-right">Solicitado</th>
                <th className="px-4 py-3 text-right">Recibido</th>
                <th className="px-4 py-3 text-right">Pendiente</th>
                <th className="px-4 py-3 text-right">P. Unitario</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orden.detalles?.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.producto?.nombre ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.producto?.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{d.cantidad_solicitada}</td>
                  <td className="px-4 py-3 text-right text-green-600">{d.cantidad_recibida}</td>
                  <td className={cn('px-4 py-3 text-right font-medium',
                    d.pendiente > 0 ? 'text-yellow-600' : 'text-green-600')}>
                    {d.pendiente > 0
                      ? <><AlertCircle className="w-3.5 h-3.5 inline mr-1" />{d.pendiente}</>
                      : '✓ Completo'
                    }
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(d.precio_unitario)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(d.cantidad_solicitada * d.precio_unitario * (1 - d.descuento_pct / 100))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t bg-gray-50">
                <td colSpan={4} className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                  <div>Subtotal</div>
                  <div>IVA (16%)</div>
                  <div className="font-semibold text-gray-900 mt-1">Total</div>
                </td>
                <td className="px-4 py-3 text-right text-xs">
                  <div>{formatCurrency(orden.subtotal)}</div>
                  <div>{formatCurrency(orden.iva)}</div>
                  <div className="font-semibold text-gray-900 mt-1">{formatCurrency(orden.total)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Recepciones registradas */}
      {orden.recepciones && orden.recepciones.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-semibold text-gray-900 text-sm">Recepciones</h2>
          </div>
          <div className="divide-y">
            {orden.recepciones.map((r: any) => (
              <div key={r.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium">{r.folio}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(r.fecha_recepcion)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(r.total)}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {r.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orden.notas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Notas</p>
          <p>{orden.notas}</p>
        </div>
      )}

      {/* Modal Recepción */}
      {recepcionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRecepcionModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Registrar Recepción — {orden.folio}</h2>
            </div>
            <div className="p-6">
              <RecepcionForm
                orden={orden}
                onSubmit={async (data) => {
                  await recepcionMutation.mutateAsync({ ordenId: id, data })
                  setRecepcionModal(false)
                  refetch()
                }}
                isLoading={recepcionMutation.isPending}
                onCancel={() => setRecepcionModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
