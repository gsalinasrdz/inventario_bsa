import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, RefreshCw, CheckCircle, XCircle, Search, Trash2 } from 'lucide-react'
import apiClient from '@/api/client'
import { useAjustes, useAjuste, useCrearAjuste, useAprobarAjuste, useRechazarAjuste } from '../hooks/useAjustes'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { AjusteInventario } from '../types/ajuste.types'

const ESTADO_CFG = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  APROBADO:  { label: 'Aprobado',  color: 'bg-green-100 text-green-700' },
  RECHAZADO: { label: 'Rechazado', color: 'bg-red-100 text-red-600' },
}

type LineaForm = { producto_id: number; nombre: string; sku: string; cantidad: number }
const LINEA_VACIA: LineaForm = { producto_id: 0, nombre: '', sku: '', cantidad: 1 }

function AjusteForm({ onSubmit, isLoading, onCancel }: { onSubmit: (d: any) => void; isLoading?: boolean; onCancel: () => void }) {
  const [almacenId,   setAlmacenId]   = useState<number | ''>('')
  const [fecha,       setFecha]       = useState(new Date().toISOString().split('T')[0])
  const [tipo,        setTipo]        = useState('ENTRADA')
  const [motivo,      setMotivo]      = useState('')
  const [notas,       setNotas]       = useState('')
  const [lineas,      setLineas]      = useState<LineaForm[]>([{ ...LINEA_VACIA }])
  const [busqueda,    setBusqueda]    = useState('')
  const [lineaActiva, setLineaActiva] = useState<number | null>(null)

  const { data: almacenesData } = useQuery({ queryKey: ['almacenes'], queryFn: () => apiClient.get('/almacenes').then(r => r.data.data) })
  const { data: productosData } = useQuery({ queryKey: ['productos-search', busqueda], queryFn: () => apiClient.get('/productos', { params: { search: busqueda, per_page: 10 } }).then(r => r.data), enabled: busqueda.length >= 2 })

  const seleccionar = (i: number, p: any) => {
    setLineas(lineas.map((l, idx) => idx === i ? { ...l, producto_id: p.id, nombre: p.nombre, sku: p.codigo_sku } : l))
    setLineaActiva(null); setBusqueda('')
  }
  const upd = (i: number, f: keyof LineaForm, v: any) => setLineas(lineas.map((l, idx) => idx === i ? { ...l, [f]: v } : l))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!almacenId || !motivo) return
    onSubmit({ almacen_id: almacenId, fecha_ajuste: fecha, tipo, motivo, notas: notas || undefined,
      detalles: lineas.filter(l => l.producto_id).map(l => ({ producto_id: l.producto_id, cantidad: l.cantidad })) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Almacén <span className="text-destructive">*</span></label>
          <select value={almacenId} onChange={e => setAlmacenId(Number(e.target.value) || '')} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Seleccionar —</option>
            {almacenesData?.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo <span className="text-destructive">*</span></label>
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="ENTRADA">Entrada (incremento)</option>
            <option value="SALIDA">Salida (decremento)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-destructive">*</span></label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Motivo <span className="text-destructive">*</span></label>
          <input type="text" value={motivo} onChange={e => setMotivo(e.target.value)} required placeholder="Ej. Conteo físico, Error de sistema"
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
          <span className="text-xs font-semibold text-gray-700">Productos a ajustar</span>
          <button type="button" onClick={() => setLineas([...lineas, { ...LINEA_VACIA }])}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground uppercase bg-gray-50">
            <th className="px-3 py-2 text-left">Producto</th>
            <th className="px-3 py-2 text-right">Cantidad</th>
            <th className="w-8" />
          </tr></thead>
          <tbody className="divide-y">
            {lineas.map((l, i) => (
              <tr key={i}>
                <td className="px-3 py-2 relative">
                  {l.producto_id ? (
                    <div className="flex items-center justify-between gap-2">
                      <div><p className="font-medium text-xs">{l.nombre}</p><p className="text-xs text-muted-foreground font-mono">{l.sku}</p></div>
                      <button type="button" onClick={() => upd(i, 'producto_id', 0)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input type="text" placeholder="Buscar..." value={lineaActiva === i ? busqueda : ''} onFocus={() => setLineaActiva(i)} onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                      {lineaActiva === i && productosData?.data?.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-border rounded-lg shadow-lg max-h-36 overflow-y-auto mt-0.5">
                          {productosData.data.map((p: any) => (
                            <button key={p.id} type="button" onClick={() => seleccionar(i, p)}
                              className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 border-b last:border-0">
                              <p className="font-medium">{p.nombre}</p><p className="text-muted-foreground font-mono">{p.codigo_sku}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2"><input type="number" min="0.001" step="0.001" value={l.cantidad} onChange={e => upd(i, 'cantidad', Number(e.target.value))}
                  className="w-24 text-right px-2 py-1 border border-input rounded text-xs" /></td>
                <td className="px-2 py-2">{lineas.length > 1 && <button type="button" onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}
                  className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} disabled={isLoading} className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50">Cancelar</button>
        <button type="submit" disabled={isLoading || !almacenId || !motivo}
          className={cn('px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary/90', (isLoading || !almacenId || !motivo) && 'opacity-70 cursor-not-allowed')}>
          {isLoading ? 'Guardando...' : 'Solicitar Ajuste'}
        </button>
      </div>
    </form>
  )
}

function DetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data, isLoading } = useAjuste(id)
  const a = data?.data
  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
  if (!a) return null
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-muted-foreground">Folio</p><p className="font-mono font-medium">{a.folio}</p></div>
        <div><p className="text-xs text-muted-foreground">Tipo</p>
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', a.tipo === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
            {a.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
          </span>
        </div>
        <div><p className="text-xs text-muted-foreground">Almacén</p><p>{a.almacen ?? '—'}</p></div>
        <div><p className="text-xs text-muted-foreground">Fecha</p><p>{formatDate(a.fecha_ajuste)}</p></div>
        <div className="col-span-2"><p className="text-xs text-muted-foreground">Motivo</p><p>{a.motivo}</p></div>
      </div>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead><tr className="bg-gray-50 border-b text-xs text-muted-foreground uppercase">
          <th className="px-3 py-2 text-left">Producto</th>
          <th className="px-3 py-2 text-right">Cantidad</th>
        </tr></thead>
        <tbody className="divide-y">
          {a.detalles?.map((d: any) => (
            <tr key={d.id}>
              <td className="px-3 py-2"><p className="font-medium text-xs">{d.producto?.nombre}</p><p className="text-xs text-muted-foreground font-mono">{d.producto?.sku}</p></td>
              <td className="px-3 py-2 text-right text-xs font-medium">{d.cantidad}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end pt-2 border-t">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50">Cerrar</button>
      </div>
    </div>
  )
}

export default function AjustesPage() {
  const { can } = usePermissions()
  const [estadoFilter, setEstadoFilter] = useState('')
  const [page, setPage] = useState(1)
  const [crearModal, setCrearModal] = useState(false)
  const [detailId,   setDetailId]   = useState<number | null>(null)
  const [aprobarTarget,  setAprobarTarget]  = useState<AjusteInventario | null>(null)
  const [rechazarTarget, setRechazarTarget] = useState<AjusteInventario | null>(null)

  const { data, isLoading, refetch } = useAjustes({ estado: estadoFilter || undefined, page, per_page: 25 })
  const crearMutation    = useCrearAjuste()
  const aprobarMutation  = useAprobarAjuste()
  const rechazarMutation = useRechazarAjuste()

  const items = data?.data ?? []
  const meta  = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajustes de Inventario</h1>
          <p className="text-sm text-muted-foreground">{meta ? `${meta.total} ajustes` : 'Correcciones manuales de stock'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
          {can('ajustes.crear') && (
            <button onClick={() => setCrearModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Nuevo Ajuste
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4">
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADO">Aprobado</option>
          <option value="RECHAZADO">Rechazado</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y">{Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 animate-pulse"><div className="h-3.5 bg-gray-200 rounded w-24" /><div className="flex-1 h-3.5 bg-gray-100 rounded" /></div>
          ))}</div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><p>Sin ajustes</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase">
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Almacén</th>
              <th className="px-4 py-3">Motivo</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr></thead>
            <tbody className="divide-y">
              {items.map((a: AjusteInventario) => {
                const cfg = ESTADO_CFG[a.estado] ?? ESTADO_CFG.PENDIENTE
                return (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      <button onClick={() => setDetailId(a.id)} className="text-primary hover:underline">{a.folio}</button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', a.tipo === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                        {a.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{a.almacen ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs max-w-[180px] truncate">{a.motivo}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(a.fecha_ajuste)}</td>
                    <td className="px-4 py-3 text-right"><span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {can('ajustes.aprobar') && a.estado === 'PENDIENTE' && (<>
                          <button onClick={() => setAprobarTarget(a)} className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded" title="Aprobar"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => setRechazarTarget(a)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded" title="Rechazar"><XCircle className="w-4 h-4" /></button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Mostrando {meta.from}–{meta.to} de {meta.total}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40">‹ Anterior</button>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40">Siguiente ›</button>
            </div>
          </div>
        )}
      </div>

      {crearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCrearModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10"><h2 className="text-lg font-semibold">Nuevo Ajuste de Inventario</h2></div>
            <div className="p-6"><AjusteForm onSubmit={async (d) => { await crearMutation.mutateAsync(d); setCrearModal(false) }} isLoading={crearMutation.isPending} onCancel={() => setCrearModal(false)} /></div>
          </div>
        </div>
      )}

      {detailId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10"><h2 className="text-lg font-semibold">Detalle de Ajuste</h2></div>
            <div className="p-6"><DetailModal id={detailId} onClose={() => setDetailId(null)} /></div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!aprobarTarget} title="Aprobar Ajuste"
        description={`¿Aprobar el ajuste "${aprobarTarget?.folio}"? El stock será modificado.`}
        confirmLabel="Sí, aprobar" isLoading={aprobarMutation.isPending}
        onConfirm={() => aprobarTarget && aprobarMutation.mutate(aprobarTarget.id, { onSuccess: () => setAprobarTarget(null) })}
        onCancel={() => setAprobarTarget(null)} />

      <ConfirmDialog open={!!rechazarTarget} title="Rechazar Ajuste"
        description={`¿Rechazar el ajuste "${rechazarTarget?.folio}"?`}
        confirmLabel="Sí, rechazar" variant="warning" isLoading={rechazarMutation.isPending}
        onConfirm={() => rechazarTarget && rechazarMutation.mutate(rechazarTarget.id, { onSuccess: () => setRechazarTarget(null) })}
        onCancel={() => setRechazarTarget(null)} />
    </div>
  )
}
