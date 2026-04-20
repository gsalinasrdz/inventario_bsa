import { useState } from 'react'
import { Plus, RefreshCw, Eye, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useVentas, useCrearVenta, useCancelarVenta } from '../hooks/useVentas'
import VentaForm from '../components/VentaForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Venta } from '../types/venta.types'

const ESTADO_CFG = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  COBRADA:   { label: 'Cobrada',   color: 'bg-green-100 text-green-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
}

const PAGO_CFG: Record<string, string> = {
  CONTADO:       'Contado',
  CREDITO:       'Crédito',
  TRANSFERENCIA: 'Transferencia',
  CHEQUE:        'Cheque',
}

export default function VentasPage() {
  const { can } = usePermissions()

  const [estadoFilter, setEstadoFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Venta | null>(null)

  const { data, isLoading, refetch } = useVentas({
    estado:   estadoFilter || undefined,
    page,
    per_page: 25,
  })

  const crearMutation   = useCrearVenta()
  const cancelarMutation = useCancelarVenta()

  const ventas = data?.data ?? []
  const meta   = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ventas</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} ventas registradas` : 'Registro de ventas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('ventas.crear') && (
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Nueva Venta
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 flex gap-3">
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="COBRADA">Cobrada</option>
          <option value="CANCELADA">Cancelada</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="h-3.5 bg-gray-200 rounded w-24" />
                <div className="flex-1 h-3.5 bg-gray-100 rounded" />
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        ) : ventas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Sin ventas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3">Folio</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Pago</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ventas.map((v: Venta) => {
                  const cfg = ESTADO_CFG[v.estado] ?? ESTADO_CFG.PENDIENTE
                  return (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium">{v.folio}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{v.cliente?.nombre ?? '—'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{v.cliente?.codigo}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(v.fecha_venta)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{PAGO_CFG[v.tipo_pago] ?? v.tipo_pago}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(v.total)}</td>
                      <td className={cn('px-4 py-3 text-right font-medium',
                        v.saldo > 0 ? 'text-red-600' : 'text-green-600')}>
                        {formatCurrency(v.saldo)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/ventas/${v.id}`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {can('ventas.cancelar') && v.estado !== 'CANCELADA' && (
                            <button onClick={() => setCancelTarget(v)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Mostrando {meta.from}–{meta.to} de {meta.total}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40">‹ Anterior</button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40">Siguiente ›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nueva Venta */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Nueva Venta</h2>
            </div>
            <div className="p-6">
              <VentaForm
                onSubmit={async (data) => { await crearMutation.mutateAsync(data); setModalOpen(false) }}
                isLoading={crearMutation.isPending}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancelar Venta"
        description={`¿Cancelar la venta "${cancelTarget?.folio}"? El stock será revertido.`}
        confirmLabel="Sí, cancelar"
        variant="warning"
        isLoading={cancelarMutation.isPending}
        onConfirm={() => cancelTarget && cancelarMutation.mutate({ id: cancelTarget.id })}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  )
}
