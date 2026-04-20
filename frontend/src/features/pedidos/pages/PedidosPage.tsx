import { useState } from 'react'
import { Plus, RefreshCw, CheckCircle, XCircle, ShoppingCart } from 'lucide-react'
import {
  usePedidos,
  useCrearPedido,
  useConfirmarPedido,
  useCancelarPedido,
  useConvertirVenta,
} from '@/features/ventas/hooks/useVentas'
import PedidoForm from '@/features/ventas/components/PedidoForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Pedido } from '@/features/ventas/types/venta.types'
import apiClient from '@/api/client'
import { useQuery } from '@tanstack/react-query'

const ESTADO_CFG: Record<string, { label: string; color: string }> = {
  PENDIENTE:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-blue-100   text-blue-700'   },
  EN_RUTA:    { label: 'En ruta',    color: 'bg-purple-100 text-purple-700' },
  ENTREGADO:  { label: 'Entregado',  color: 'bg-green-100  text-green-700'  },
  CANCELADO:  { label: 'Cancelado',  color: 'bg-red-100    text-red-600'    },
}

interface ConvertirModalState {
  pedido: Pedido
  almacen_id: number | ''
  tipo_pago: string
}

export default function PedidosPage() {
  const { can } = usePermissions()

  const [estadoFilter, setEstadoFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Pedido | null>(null)
  const [convertir,    setConvertir]    = useState<ConvertirModalState | null>(null)

  const { data, isLoading, refetch } = usePedidos({
    estado:   estadoFilter || undefined,
    page,
    per_page: 25,
  })

  const { data: almacenesData } = useQuery({
    queryKey: ['almacenes'],
    queryFn: () => apiClient.get('/almacenes').then(r => r.data.data),
  })

  const crearMutation     = useCrearPedido()
  const confirmarMutation = useConfirmarPedido()
  const cancelarMutation  = useCancelarPedido()
  const convertirMutation = useConvertirVenta()

  const pedidos = data?.data ?? []
  const meta    = data?.meta

  const handleConvertir = () => {
    if (!convertir || !convertir.almacen_id || !convertir.tipo_pago) return
    convertirMutation.mutate(
      { id: convertir.pedido.id, data: { almacen_id: convertir.almacen_id, tipo_pago: convertir.tipo_pago } },
      { onSuccess: () => setConvertir(null) },
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} pedidos registrados` : 'Preventa y órdenes de clientes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('pedidos.crear') && (
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Nuevo Pedido
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 flex gap-3 flex-wrap">
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Todos los estados</option>
          {Object.entries(ESTADO_CFG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <ShoppingCart className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-lg font-medium">Sin pedidos</p>
            <p className="text-sm">
              {estadoFilter ? 'No hay pedidos con ese estado.' : 'Cree el primer pedido de preventa.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-medium text-muted-foreground uppercase">
                  <th className="px-4 py-3 text-left">Folio</th>
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-left">Ruta</th>
                  <th className="px-4 py-3 text-left">Entrega</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {pedidos.map((p: Pedido) => {
                  const estado = ESTADO_CFG[p.estado] ?? ESTADO_CFG.PENDIENTE
                  const acciones = p.estado === 'PENDIENTE' || p.estado === 'CONFIRMADO'
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-primary text-xs">{p.folio}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 text-xs">{p.cliente?.nombre ?? '—'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.cliente?.codigo}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.ruta ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {p.fecha_entrega ? formatDate(p.fecha_entrega) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-xs">{formatCurrency(p.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', estado.color)}>
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        {acciones && (
                          <div className="flex items-center gap-1 justify-end">
                            {p.estado === 'PENDIENTE' && can('pedidos.gestionar') && (
                              <button
                                onClick={() => confirmarMutation.mutate(p.id)}
                                disabled={confirmarMutation.isPending}
                                title="Confirmar pedido"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {can('ventas.crear') && (
                              <button
                                onClick={() => setConvertir({ pedido: p, almacen_id: '', tipo_pago: 'CONTADO' })}
                                title="Convertir a venta"
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors">
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            )}
                            {can('pedidos.gestionar') && (
                              <button
                                onClick={() => setCancelTarget(p)}
                                title="Cancelar pedido"
                                className="p-1.5 text-destructive hover:bg-destructive/5 rounded transition-colors">
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>{meta.from}–{meta.to} de {meta.total}</span>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 border border-input rounded hover:bg-gray-50 disabled:opacity-40 transition-colors text-xs">
                Anterior
              </button>
              <button disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 border border-input rounded hover:bg-gray-50 disabled:opacity-40 transition-colors text-xs">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nuevo Pedido */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex-shrink-0">
              <h2 className="text-lg font-semibold">Nuevo Pedido</h2>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <PedidoForm
                isLoading={crearMutation.isPending}
                onCancel={() => setModalOpen(false)}
                onSubmit={(data) =>
                  crearMutation.mutate(data, {
                    onSuccess: () => setModalOpen(false),
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Convertir a Venta */}
      {convertir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConvertir(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Convertir a Venta</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Pedido <span className="font-mono font-medium">{convertir.pedido.folio}</span>
                {' '}— {convertir.pedido.cliente?.nombre}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Almacén de salida <span className="text-destructive">*</span>
                </label>
                <select
                  value={convertir.almacen_id}
                  onChange={e => setConvertir(c => c ? { ...c, almacen_id: Number(e.target.value) || '' } : c)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Seleccionar —</option>
                  {almacenesData?.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de pago <span className="text-destructive">*</span>
                </label>
                <select
                  value={convertir.tipo_pago}
                  onChange={e => setConvertir(c => c ? { ...c, tipo_pago: e.target.value } : c)}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="CONTADO">Contado</option>
                  <option value="CREDITO">Crédito</option>
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setConvertir(null)}
                  className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button
                  onClick={handleConvertir}
                  disabled={!convertir.almacen_id || convertirMutation.isPending}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-70 transition-colors">
                  {convertirMutation.isPending ? 'Procesando...' : 'Generar Venta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm cancelar */}
      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar Pedido"
        description={`¿Desea cancelar el pedido "${cancelTarget?.folio}"? Esta acción no se puede deshacer.`}
        confirmLabel="Sí, cancelar"
        isLoading={cancelarMutation.isPending}
        onConfirm={() => cancelTarget && cancelarMutation.mutate(cancelTarget.id, { onSuccess: () => setCancelTarget(null) })}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
