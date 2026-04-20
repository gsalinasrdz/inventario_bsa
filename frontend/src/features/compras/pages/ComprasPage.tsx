import { useState } from 'react'
import { Plus, RefreshCw, Eye, CheckCircle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  useOrdenes, useCrearOrden, useAprobarOrden, useEliminarOrden,
} from '../hooks/useCompras'
import OrdenCompraForm from '../components/OrdenCompraForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrdenCompra } from '../types/compra.types'

const ESTADO_CONFIG = {
  BORRADOR:  { label: 'Borrador',  color: 'bg-gray-100 text-gray-600' },
  ENVIADA:   { label: 'Enviada',   color: 'bg-blue-100 text-blue-700' },
  PARCIAL:   { label: 'Parcial',   color: 'bg-yellow-100 text-yellow-700' },
  COMPLETA:  { label: 'Completa',  color: 'bg-green-100 text-green-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
}

export default function ComprasPage() {
  const { can } = usePermissions()

  const [estadoFilter, setEstadoFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const [modalOpen,    setModalOpen]    = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrdenCompra | null>(null)

  const { data, isLoading, refetch } = useOrdenes({
    estado:   estadoFilter || undefined,
    page,
    per_page: 20,
  })

  const crearMutation   = useCrearOrden()
  const aprobarMutation = useAprobarOrden()
  const eliminarMutation = useEliminarOrden()

  const ordenes = data?.data ?? []
  const meta    = data?.meta

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compras</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} órdenes de compra` : 'Órdenes de compra y recepciones'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar">
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('compras.crear') && (
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Nueva Orden
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4">
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Todos los estados</option>
          <option value="BORRADOR">Borrador</option>
          <option value="ENVIADA">Enviada</option>
          <option value="PARCIAL">Parcial</option>
          <option value="COMPLETA">Completa</option>
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
        ) : ordenes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Sin órdenes de compra</p>
            <p className="text-sm">Cree la primera orden con el botón de arriba.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3">Folio</th>
                  <th className="px-4 py-3">Proveedor</th>
                  <th className="px-4 py-3">Almacén</th>
                  <th className="px-4 py-3">Fecha esperada</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ordenes.map((o: OrdenCompra) => {
                  const cfg = ESTADO_CONFIG[o.estado] ?? ESTADO_CONFIG.BORRADOR
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">
                        {o.folio}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.proveedor?.nombre ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{o.almacen ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.fecha_esperada ? formatDate(o.fecha_esperada) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">{formatCurrency(o.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/compras/${o.id}`}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Ver detalle">
                            <Eye className="w-4 h-4" />
                          </Link>
                          {can('compras.aprobar') && o.estado === 'BORRADOR' && (
                            <button onClick={() => aprobarMutation.mutate(o.id)}
                              className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="Enviar al proveedor">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {can('compras.eliminar') && o.estado === 'BORRADOR' && (
                            <button onClick={() => setDeleteTarget(o)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                              title="Eliminar">
                              <Trash2 className="w-4 h-4" />
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
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40">
                ‹ Anterior
              </button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40">
                Siguiente ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nueva OC */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Nueva Orden de Compra</h2>
            </div>
            <div className="p-6">
              <OrdenCompraForm
                onSubmit={async (data) => {
                  await crearMutation.mutateAsync(data)
                  setModalOpen(false)
                }}
                isLoading={crearMutation.isPending}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Orden"
        description={`¿Eliminar la orden "${deleteTarget?.folio}"?`}
        confirmLabel="Sí, eliminar"
        isLoading={eliminarMutation.isPending}
        onConfirm={() => deleteTarget && eliminarMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
