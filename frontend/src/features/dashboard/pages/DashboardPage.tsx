import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Truck, ClipboardList, AlertTriangle,
  Users, Package, RefreshCw, CheckCircle2, Clock,
} from 'lucide-react'
import apiClient from '@/api/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn:  () => apiClient.get('/reportes/dashboard').then(r => r.data),
    staleTime: 60_000,
    refetchInterval: 300_000,
  })
}

interface KpiProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  color: string
  to?: string
}

function KpiCard({ label, value, sub, icon, color, to }: KpiProps) {
  const inner = (
    <div className={cn('bg-white rounded-xl border border-border p-5 flex items-start gap-4 transition-shadow', to && 'hover:shadow-md cursor-pointer')}>
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide truncate">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function AlertBadge({ count, label, to, color }: { count: number; label: string; to: string; color: string }) {
  if (count === 0) return null
  return (
    <Link to={to} className={cn('flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors', color)}>
      <span>{label}</span>
      <span className="font-bold tabular-nums">{count}</span>
    </Link>
  )
}

const ESTADO_VENTA: Record<string, { label: string; color: string }> = {
  COBRADA:   { label: 'Cobrada',   color: 'bg-green-100 text-green-700' },
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-600' },
}

export default function DashboardPage() {
  const { data, isLoading, refetch, isFetching } = useDashboard()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!data) return null

  const pendientesTotal =
    (data.mermas_pendientes ?? 0) +
    (data.ajustes_pendientes ?? 0) +
    (data.devoluciones_pendientes ?? 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Resumen operativo — {formatDate(new Date().toISOString())}</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching}
          className="p-2 text-muted-foreground hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
        </button>
      </div>

      {/* KPI Grid — Ventas */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Ventas</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Ventas hoy"
            value={formatCurrency(data.ventas_hoy?.total ?? 0)}
            sub={`${data.ventas_hoy?.cantidad ?? 0} transacciones`}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-primary"
            to="/ventas"
          />
          <KpiCard
            label="Ventas del mes"
            value={formatCurrency(data.ventas_mes?.total ?? 0)}
            sub={`${data.ventas_mes?.cantidad ?? 0} ventas`}
            icon={<TrendingUp className="w-5 h-5 text-white" />}
            color="bg-blue-500"
            to="/ventas"
          />
          <KpiCard
            label="Cobrado este mes"
            value={formatCurrency(data.ventas_mes?.cobrado ?? 0)}
            sub="Pagos recibidos"
            icon={<CheckCircle2 className="w-5 h-5 text-white" />}
            color="bg-green-500"
          />
          <KpiCard
            label="Clientes con deuda"
            value={`${data.clientes_con_deuda?.cantidad ?? 0}`}
            sub={formatCurrency(data.clientes_con_deuda?.total ?? 0)}
            icon={<Users className="w-5 h-5 text-white" />}
            color="bg-orange-500"
            to="/reportes"
          />
        </div>
      </section>

      {/* KPI Grid — Operaciones */}
      <section>
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Operaciones</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Cargas en ruta"
            value={String(data.cargas_en_ruta ?? 0)}
            sub="Activas ahora"
            icon={<Truck className="w-5 h-5 text-white" />}
            color="bg-purple-500"
            to="/cargas"
          />
          <KpiCard
            label="Pedidos pendientes"
            value={String(data.pedidos_pendientes ?? 0)}
            sub="Por confirmar o entregar"
            icon={<ClipboardList className="w-5 h-5 text-white" />}
            color="bg-cyan-500"
            to="/pedidos"
          />
          <KpiCard
            label="Sin stock"
            value={String(data.sin_stock ?? 0)}
            sub="Productos agotados"
            icon={<Package className="w-5 h-5 text-white" />}
            color={data.sin_stock > 0 ? 'bg-red-500' : 'bg-gray-400'}
            to="/inventario"
          />
          <KpiCard
            label="Stock bajo"
            value={String(data.stock_bajo ?? 0)}
            sub="Bajo mínimo"
            icon={<AlertTriangle className="w-5 h-5 text-white" />}
            color={data.stock_bajo > 0 ? 'bg-yellow-500' : 'bg-gray-400'}
            to="/inventario"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pendientes de aprobación */}
        {pendientesTotal > 0 && (
          <div className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-gray-900">Pendientes de aprobación</h3>
            </div>
            <div className="space-y-1.5">
              <AlertBadge count={data.devoluciones_pendientes} label="Devoluciones" to="/devoluciones" color="bg-blue-50 text-blue-700 hover:bg-blue-100" />
              <AlertBadge count={data.mermas_pendientes}      label="Mermas"       to="/mermas"       color="bg-orange-50 text-orange-700 hover:bg-orange-100" />
              <AlertBadge count={data.ajustes_pendientes}     label="Ajustes"      to="/ajustes"      color="bg-purple-50 text-purple-700 hover:bg-purple-100" />
            </div>
          </div>
        )}

        {/* Últimas ventas */}
        <div className={cn('bg-white rounded-xl border border-border p-4', pendientesTotal > 0 ? 'lg:col-span-2' : 'lg:col-span-2')}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Últimas ventas</h3>
            <Link to="/ventas" className="text-xs text-primary hover:underline">Ver todas</Link>
          </div>
          {data.ultimas_ventas?.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Sin ventas registradas</p>
          ) : (
            <div className="divide-y">
              {data.ultimas_ventas?.map((v: any) => {
                const estado = ESTADO_VENTA[v.estado] ?? ESTADO_VENTA.PENDIENTE
                return (
                  <div key={v.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <Link to={`/ventas/${v.id}`} className="text-sm font-mono font-medium text-primary hover:underline">{v.folio}</Link>
                      <p className="text-xs text-muted-foreground truncate">{v.cliente ?? '—'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(v.total)}</p>
                      <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded-full', estado.color)}>{estado.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Stock crítico */}
      {data.stock_critico?.length > 0 && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-semibold text-gray-900">Alerta de stock</h3>
            </div>
            <Link to="/inventario" className="text-xs text-primary hover:underline">Ver inventario</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs font-medium text-muted-foreground uppercase">
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-right">Stock actual</th>
                  <th className="px-4 py-2 text-right">Mínimo</th>
                  <th className="px-4 py-2 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.stock_critico.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900 text-xs">{p.nombre}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold tabular-nums text-xs">{p.cantidad}</td>
                    <td className="px-4 py-2 text-right text-muted-foreground text-xs">{p.stock_minimo}</td>
                    <td className="px-4 py-2 text-right">
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                        p.cantidad === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      )}>
                        {p.cantidad === 0 ? 'Agotado' : 'Stock bajo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
