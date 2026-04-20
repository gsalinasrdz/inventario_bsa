import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, RefreshCw, CheckCircle, XCircle, Search, Trash2 } from 'lucide-react'
import apiClient from '@/api/client'
import { useMermas, useMerma, useCrearMerma, useAprobarMerma, useRechazarMerma } from '../hooks/useMermas'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Merma } from '../types/merma.types'

const ESTADO_CFG = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  APROBADA:  { label: 'Aprobada',  color: 'bg-green-100 text-green-700' },
  RECHAZADA: { label: 'Rechazada', color: 'bg-red-100 text-red-600' },
}
const TIPO_CFG: Record<string, string> = {
  VENCIMIENTO: 'Vencimiento', DAÑO: 'Daño', ROBO: 'Robo', OTRO: 'Otro',
}

type LineaForm = { producto_id: number; nombre: string; sku: string; cantidad: number; motivo: string }
const LINEA_VACIA: LineaForm = { producto_id: 0, nombre: '', sku: '', cantidad: 1, motivo: '' }

function MermaForm({ onSubmit, isLoading, onCancel }: { onSubmit: (d: any) => void; isLoading?: boolean; onCancel: () => void }) {
  const [almacenId,   setAlmacenId]   = useState<number | ''>('')
  const [fecha,       setFecha]       = useState(new Date().toISOString().split('T')[0])
  const [tipoMerma,   setTipoMerma]   = useState('OTRO')
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
    if (!almacenId) return
    onSubmit({ almacen_id: almacenId, fecha_merma: fecha, tipo_merma: tipoMerma, notas: notas || undefined,
      detalles: lineas.filter(l => l.producto_id).map(l => ({ producto_id: l.producto_id, cantidad: l.cantidad, motivo: l.motivo || undefined })) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Almacén <span className="text-destructive">*</span></label>
          <select value={almacenId} onChange={e => setAlmacenId(Number(e.target.value) || '')} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Seleccionar —</option>
            {almacenesData?.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha <span className="text-destructive">*</span></label>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select value={tipoMerma} onChange={e => setTipoMerma(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="VENCIMIENTO">Vencimiento</option>
            <option value="DAÑO">Daño</option>
            <option value="ROBO">Robo</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b">
          <span className="text-xs font-semibold text-gray-700">Productos afectados</span>
          <button type="button" onClick={() => setLineas([...lineas, { ...LINEA_VACIA }])}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20">
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground uppercase bg-gray-50">
            <th className="px-3 py-2 text-left">Producto</th>
            <th className="px-3 py-2 text-right">Cant.</th>
            <th className="px-3 py-2 text-left">Motivo</th>
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
                  className="w-20 text-right px-2 py-1 border border-input rounded text-xs" /></td>
                <td className="px-3 py-2"><input type="text" value={l.motivo} onChange={e => upd(i, 'motivo', e.target.value)} placeholder="Opcional"
                  className="w-full px-2 py-1 border border-input rounded text-xs" /></td>
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
        <button type="submit" disabled={isLoading || !almacenId}
          className={cn('px-4 py-2 text-sm bg-primary text-white rounded-lg font-medium hover:bg-primary/90', (isLoading || !almacenId) && 'opacity-70 cursor-not-allowed')}>
          {isLoading ? 'Guardando...' : 'Registrar Merma'}
        </button>
      </div>
    </form>
  )
}

function DetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data, isLoading } = useMerma(id)
  const m = data?.data
  if (isLoading) return <div className="p-8 text-center text-sm text-muted-foreground">Cargando...</div>
  if (!m) return null
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><p className="text-xs text-muted-foreground">Folio</p><p className="font-mono font-medium">{m.folio}</p></div>
        <div><p className="text-xs text-muted-foreground">Tipo</p><p>{TIPO_CFG[m.tipo_merma]}</p></div>
        <div><p className="text-xs text-muted-foreground">Almacén</p><p>{m.almacen ?? '—'}</p></div>
        <div><p className="text-xs text-muted-foreground">Fecha</p><p>{formatDate(m.fecha_merma)}</p></div>
      </div>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead><tr className="bg-gray-50 border-b text-xs text-muted-foreground uppercase">
          <th className="px-3 py-2 text-left">Producto</th>
          <th className="px-3 py-2 text-right">Cant.</th>
          <th className="px-3 py-2 text-left">Motivo</th>
        </tr></thead>
        <tbody className="divide-y">
          {m.detalles?.map((d: any) => (
            <tr key={d.id}>
              <td className="px-3 py-2"><p className="font-medium text-xs">{d.producto?.nombre}</p><p className="text-xs text-muted-foreground font-mono">{d.producto?.sku}</p></td>
              <td className="px-3 py-2 text-right text-xs">{d.cantidad}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{d.motivo ?? '—'}</td>
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

export default function MermasPage() {
  const { can } = usePermissions()
  const [estadoFilter, setEstadoFilter] = useState('')
  const [page, setPage] = useState(1)
  const [crearModal, setCrearModal] = useState(false)
  const [detailId,   setDetailId]   = useState<number | null>(null)
  const [aprobarTarget,  setAprobarTarget]  = useState<Merma | null>(null)
  const [rechazarTarget, setRechazarTarget] = useState<Merma | null>(null)

  const { data, isLoading, refetch } = useMermas({ estado: estadoFilter || undefined, page, per_page: 25 })
  const crearMutation    = useCrearMerma()
  const aprobarMutation  = useAprobarMerma()
  const rechazarMutation = useRechazarMerma()

  const items = data?.data ?? []
  const meta  = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mermas</h1>
          <p className="text-sm text-muted-foreground">{meta ? `${meta.total} registros` : 'Productos dañados, vencidos o extraviados'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
          {can('mermas.crear') && (
            <button onClick={() => setCrearModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90">
              <Plus className="w-4 h-4" /> Registrar Merma
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-4">
        <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="APROBADA">Aprobada</option>
          <option value="RECHAZADA">Rechazada</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y">{Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-4 py-3 animate-pulse"><div className="h-3.5 bg-gray-200 rounded w-24" /><div className="flex-1 h-3.5 bg-gray-100 rounded" /></div>
          ))}</div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground"><p>Sin mermas</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase">
              <th className="px-4 py-3">Folio</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Almacén</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3 text-right">Items</th>
              <th className="px-4 py-3 text-right">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr></thead>
            <tbody className="divide-y">
              {items.map((m: Merma) => {
                const cfg = ESTADO_CFG[m.estado] ?? ESTADO_CFG.PENDIENTE
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-medium">
                      <button onClick={() => setDetailId(m.id)} className="text-primary hover:underline">{m.folio}</button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{TIPO_CFG[m.tipo_merma]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{m.almacen ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(m.fecha_merma)}</td>
                    <td className="px-4 py-3 text-right">{m.detalles_count}</td>
                    <td className="px-4 py-3 text-right"><span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {can('mermas.aprobar') && m.estado === 'PENDIENTE' && (<>
                          <button onClick={() => setAprobarTarget(m)} className="p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 rounded" title="Aprobar"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => setRechazarTarget(m)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded" title="Rechazar"><XCircle className="w-4 h-4" /></button>
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
            <div className="p-6 border-b sticky top-0 bg-white z-10"><h2 className="text-lg font-semibold">Registrar Merma</h2></div>
            <div className="p-6"><MermaForm onSubmit={async (d) => { await crearMutation.mutateAsync(d); setCrearModal(false) }} isLoading={crearMutation.isPending} onCancel={() => setCrearModal(false)} /></div>
          </div>
        </div>
      )}

      {detailId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDetailId(null)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10"><h2 className="text-lg font-semibold">Detalle de Merma</h2></div>
            <div className="p-6"><DetailModal id={detailId} onClose={() => setDetailId(null)} /></div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!aprobarTarget} title="Aprobar Merma"
        description={`¿Aprobar la merma "${aprobarTarget?.folio}"? El stock será descontado.`}
        confirmLabel="Sí, aprobar" isLoading={aprobarMutation.isPending}
        onConfirm={() => aprobarTarget && aprobarMutation.mutate(aprobarTarget.id, { onSuccess: () => setAprobarTarget(null) })}
        onCancel={() => setAprobarTarget(null)} />

      <ConfirmDialog open={!!rechazarTarget} title="Rechazar Merma"
        description={`¿Rechazar la merma "${rechazarTarget?.folio}"?`}
        confirmLabel="Sí, rechazar" variant="warning" isLoading={rechazarMutation.isPending}
        onConfirm={() => rechazarTarget && rechazarMutation.mutate(rechazarTarget.id, { onSuccess: () => setRechazarTarget(null) })}
        onCancel={() => setRechazarTarget(null)} />
    </div>
  )
}
