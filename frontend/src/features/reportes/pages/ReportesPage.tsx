import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Package, Truck, AlertTriangle, Users } from 'lucide-react'
import apiClient from '@/api/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Tab = 'ventas' | 'inventario' | 'cargas' | 'mermas' | 'deuda'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'ventas',     label: 'Ventas',      icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'inventario', label: 'Inventario',  icon: <Package    className="w-4 h-4" /> },
  { id: 'cargas',     label: 'Cargas',      icon: <Truck      className="w-4 h-4" /> },
  { id: 'mermas',     label: 'Mermas',      icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'deuda',      label: 'Cartera',     icon: <Users      className="w-4 h-4" /> },
]

const TIPO_PAGO: Record<string, string> = {
  CONTADO: 'Contado', CREDITO: 'Crédito', TRANSFERENCIA: 'Transferencia', CHEQUE: 'Cheque',
}
const TIPO_MERMA: Record<string, string> = {
  VENCIMIENTO: 'Vencimiento', DAÑO: 'Daño', ROBO: 'Robo', OTRO: 'Otro',
}

// ── Reporte Ventas ─────────────────────────────────────────────────────────
function ReporteVentas() {
  const [desde, setDesde] = useState(() => {
    const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]
  })
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery({
    queryKey: ['reporte-ventas', desde, hasta],
    queryFn:  () => apiClient.get('/reportes/ventas', { params: { fecha_desde: desde, fecha_hasta: hasta } }).then(r => r.data),
  })

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {isLoading ? (
        <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />
      ) : data ? (
        <div className="space-y-5">
          {/* Totales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Ventas',        value: formatCurrency(data.totales?.total ?? 0) },
              { label: 'Cobrado',       value: formatCurrency(data.totales?.cobrado ?? 0) },
              { label: 'Saldo pend.',   value: formatCurrency(data.totales?.saldo_pendiente ?? 0) },
              { label: 'Transacciones', value: String(data.totales?.cantidad ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Por tipo de pago */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Por tipo de pago</h3></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase">
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-right">Cant.</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr></thead>
                <tbody className="divide-y">
                  {data.por_tipo_pago?.map((r: any) => (
                    <tr key={r.tipo_pago} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 font-medium">{TIPO_PAGO[r.tipo_pago] ?? r.tipo_pago}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">{r.cantidad}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(r.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top clientes */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Top clientes</h3></div>
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase">
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-right">Ventas</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr></thead>
                <tbody className="divide-y">
                  {data.top_clientes?.map((c: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2 font-medium text-xs">{c.cliente ?? '—'}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">{c.cantidad}</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(c.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Por día */}
          {data.por_dia?.length > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Ventas por día</h3></div>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white"><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase">
                    <th className="px-4 py-2 text-left">Fecha</th>
                    <th className="px-4 py-2 text-right">Ventas</th>
                    <th className="px-4 py-2 text-right">Total</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {data.por_dia.map((d: any) => (
                      <tr key={d.fecha} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2 font-medium">{formatDate(d.fecha)}</td>
                        <td className="px-4 py-2 text-right text-muted-foreground">{d.cantidad}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

// ── Reporte Inventario ─────────────────────────────────────────────────────
function ReporteInventario() {
  const { data, isLoading } = useQuery({
    queryKey: ['reporte-inventario'],
    queryFn:  () => apiClient.get('/reportes/inventario').then(r => r.data),
  })

  if (isLoading) return <div className="h-40 bg-gray-50 rounded-xl animate-pulse" />

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Productos con registro</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.resumen?.productos ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Unidades en almacén</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data?.resumen?.unidades_totales ?? 0}</p>
        </div>
      </div>

      {data?.sin_stock?.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h3 className="text-sm font-semibold text-gray-900">Productos agotados ({data.sin_stock.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase">
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-left">Almacén</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.sin_stock.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2"><p className="font-medium text-xs">{p.nombre}</p><p className="text-xs text-muted-foreground font-mono">{p.sku}</p></td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{p.almacen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.stock_bajo?.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-900">Stock bajo mínimo ({data.stock_bajo.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase">
              <th className="px-4 py-2 text-left">Producto</th>
              <th className="px-4 py-2 text-right">Actual</th>
              <th className="px-4 py-2 text-right">Mínimo</th>
              <th className="px-4 py-2 text-left">Almacén</th>
            </tr></thead>
            <tbody className="divide-y">
              {data.stock_bajo.map((p: any) => (
                <tr key={`${p.id}-${p.almacen}`} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2"><p className="font-medium text-xs">{p.nombre}</p><p className="text-xs text-muted-foreground font-mono">{p.sku}</p></td>
                  <td className="px-4 py-2 text-right font-medium text-yellow-700 text-xs">{p.cantidad}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground text-xs">{p.stock_minimo}</td>
                  <td className="px-4 py-2 text-muted-foreground text-xs">{p.almacen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Reporte Cargas ─────────────────────────────────────────────────────────
function ReporteCargas() {
  const [desde, setDesde] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] })
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery({
    queryKey: ['reporte-cargas', desde, hasta],
    queryFn:  () => apiClient.get('/reportes/cargas', { params: { fecha_desde: desde, fecha_hasta: hasta } }).then(r => r.data),
  })

  const ESTADO_LABELS: Record<string, string> = { PREPARACION: 'Preparación', EN_RUTA: 'En ruta', LIQUIDADA: 'Liquidada', CANCELADA: 'Cancelada' }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-4">
        <div><label className="block text-xs text-muted-foreground mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
        <div><label className="block text-xs text-muted-foreground mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
      </div>

      {isLoading ? <div className="h-40 bg-gray-50 rounded-xl animate-pulse" /> : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Cargas por estado</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase"><th className="px-4 py-2 text-left">Estado</th><th className="px-4 py-2 text-right">Cantidad</th></tr></thead>
              <tbody className="divide-y">
                {Object.entries(data.por_estado ?? {}).map(([estado, cantidad]) => (
                  <tr key={estado} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2 font-medium">{ESTADO_LABELS[estado] ?? estado}</td>
                    <td className="px-4 py-2 text-right font-bold">{String(cantidad)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-semibold">Liquidaciones</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total liquidaciones</span><span className="font-semibold">{data.liquidaciones?.cantidad ?? 0}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Efectivo esperado</span><span className="font-semibold">{formatCurrency(data.liquidaciones?.esperado ?? 0)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Efectivo recibido</span><span className="font-semibold">{formatCurrency(data.liquidaciones?.recibido ?? 0)}</span></div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Diferencia total</span>
                <span className={cn('font-bold', (data.liquidaciones?.diferencia ?? 0) >= 0 ? 'text-green-600' : 'text-destructive')}>
                  {(data.liquidaciones?.diferencia ?? 0) >= 0 ? '+' : ''}{formatCurrency(data.liquidaciones?.diferencia ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Reporte Mermas ─────────────────────────────────────────────────────────
function ReporteMermas() {
  const [desde, setDesde] = useState(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] })
  const [hasta, setHasta] = useState(new Date().toISOString().split('T')[0])

  const { data, isLoading } = useQuery({
    queryKey: ['reporte-mermas', desde, hasta],
    queryFn:  () => apiClient.get('/reportes/mermas', { params: { fecha_desde: desde, fecha_hasta: hasta } }).then(r => r.data),
  })

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-border p-4 flex flex-wrap gap-4">
        <div><label className="block text-xs text-muted-foreground mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
        <div><label className="block text-xs text-muted-foreground mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
      </div>

      {isLoading ? <div className="h-40 bg-gray-50 rounded-xl animate-pulse" /> : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Por tipo</h3></div>
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase"><th className="px-4 py-2 text-left">Tipo</th><th className="px-4 py-2 text-right">Registros</th></tr></thead>
              <tbody className="divide-y">
                {data.por_tipo?.map((r: any) => (
                  <tr key={r.tipo} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2 font-medium">{TIPO_MERMA[r.tipo] ?? r.tipo}</td>
                    <td className="px-4 py-2 text-right font-bold">{r.cantidad}</td>
                  </tr>
                ))}
                {data.por_tipo?.length === 0 && <tr><td colSpan={2} className="px-4 py-4 text-center text-muted-foreground text-xs">Sin mermas en este período</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Recientes aprobadas</h3></div>
            <div className="divide-y max-h-64 overflow-y-auto">
              {data.recientes?.map((m: any, i: number) => (
                <div key={i} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-mono font-medium text-xs">{m.folio}</p>
                    <p className="text-xs text-muted-foreground">{m.almacen} · {TIPO_MERMA[m.tipo] ?? m.tipo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-medium">{m.items} items</p>
                    <p className="text-xs text-muted-foreground">{formatDate(m.fecha)}</p>
                  </div>
                </div>
              ))}
              {data.recientes?.length === 0 && <p className="px-4 py-4 text-center text-muted-foreground text-xs">Sin mermas aprobadas</p>}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

// ── Reporte Cartera / Clientes Deuda ──────────────────────────────────────
function ReporteDeuda() {
  const { data, isLoading } = useQuery({
    queryKey: ['reporte-deuda'],
    queryFn:  () => apiClient.get('/reportes/clientes-deuda', { params: { per_page: 50 } }).then(r => r.data),
  })

  return (
    <div className="space-y-5">
      {isLoading ? <div className="h-40 bg-gray-50 rounded-xl animate-pulse" /> : data ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Clientes con deuda</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{data.meta?.total ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Deuda total</p>
              <p className="text-2xl font-bold text-destructive mt-1">{formatCurrency(data.meta?.total_deuda ?? 0)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b"><h3 className="text-sm font-semibold">Detalle por cliente</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase">
                  <th className="px-4 py-2 text-left">Cliente</th>
                  <th className="px-4 py-2 text-left">Ruta</th>
                  <th className="px-4 py-2 text-right">Saldo pend.</th>
                  <th className="px-4 py-2 text-right">Límite crédito</th>
                  <th className="px-4 py-2 text-right">% Usado</th>
                </tr></thead>
                <tbody className="divide-y">
                  {data.data?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2">
                        <p className="font-medium text-xs">{c.nombre}</p>
                        <p className="text-xs text-muted-foreground font-mono">{c.codigo}</p>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{c.ruta ?? '—'}</td>
                      <td className="px-4 py-2 text-right font-semibold text-destructive text-xs">{formatCurrency(c.saldo_pendiente)}</td>
                      <td className="px-4 py-2 text-right text-xs text-muted-foreground">{c.credito_limite > 0 ? formatCurrency(c.credito_limite) : '—'}</td>
                      <td className="px-4 py-2 text-right">
                        {c.uso_credito_pct !== null ? (
                          <span className={cn('text-xs font-medium', c.uso_credito_pct >= 90 ? 'text-red-600' : c.uso_credito_pct >= 70 ? 'text-yellow-600' : 'text-green-600')}>
                            {c.uso_credito_pct}%
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

// ── Page principal ────────────────────────────────────────────────────────
export default function ReportesPage() {
  const [tab, setTab] = useState<Tab>('ventas')

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-sm text-muted-foreground">Análisis operativo y financiero</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-border p-1 flex flex-wrap gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.id
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:bg-gray-100 hover:text-gray-900',
            )}>
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel activo */}
      {tab === 'ventas'     && <ReporteVentas />}
      {tab === 'inventario' && <ReporteInventario />}
      {tab === 'cargas'     && <ReporteCargas />}
      {tab === 'mermas'     && <ReporteMermas />}
      {tab === 'deuda'      && <ReporteDeuda />}
    </div>
  )
}
