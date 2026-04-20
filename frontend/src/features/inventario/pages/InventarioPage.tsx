import { useState } from 'react'
import { Search, RefreshCw, Package, TrendingDown, XCircle } from 'lucide-react'
import { useStock, useStockResumen } from '../hooks/useInventario'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type { StockItem } from '../types/inventario.types'

const ESTADO_CONFIG = {
  NORMAL: { label: 'Normal',  color: 'text-green-600 bg-green-50' },
  BAJO:   { label: 'Bajo',    color: 'text-yellow-600 bg-yellow-50' },
  AGOTADO:{ label: 'Agotado', color: 'text-red-600 bg-red-50' },
  EXCESO: { label: 'Exceso',  color: 'text-blue-600 bg-blue-50' },
}

export default function InventarioPage() {
  const [search,      setSearch]      = useState('')
  const [stockFiltro, setStockFiltro] = useState('')
  const [page,        setPage]        = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, refetch } = useStock({
    search:     debouncedSearch || undefined,
    stock_bajo: stockFiltro === 'bajo' ? true : undefined,
    page,
    per_page:   40,
  })

  const { data: resumenData } = useStockResumen()

  const items = data?.data ?? []
  const meta  = data?.meta

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      {resumenData?.data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={<Package className="w-5 h-5 text-blue-600" />}
            label="Total Productos" value={resumenData.data.total} color="blue" />
          <KpiCard icon={<Package className="w-5 h-5 text-green-600" />}
            label="Activos" value={resumenData.data.activos} color="green" />
          <KpiCard icon={<TrendingDown className="w-5 h-5 text-yellow-600" />}
            label="Stock Bajo" value={resumenData.data.stockBajo} color="yellow" />
          <KpiCard icon={<XCircle className="w-5 h-5 text-red-600" />}
            label="Sin Stock" value={resumenData.data.sinStock} color="red" />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} productos en inventario` : 'Stock en tiempo real'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors self-start sm:self-auto"
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={stockFiltro}
          onChange={e => { setStockFiltro(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos</option>
          <option value="bajo">Stock Bajo / Agotado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
                <div className="h-3.5 bg-gray-200 rounded w-32" />
                <div className="flex-1 h-3.5 bg-gray-100 rounded" />
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Sin resultados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Disponible</th>
                  <th className="px-4 py-3 text-right">Reservado</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Mín</th>
                  <th className="px-4 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item: StockItem) => {
                  const cfg = ESTADO_CONFIG[item.estado_stock] ?? ESTADO_CONFIG.NORMAL
                  return (
                    <tr key={item.id} className={cn(
                      'hover:bg-gray-50/50 transition-colors',
                      item.estado_stock === 'AGOTADO' && 'bg-red-50/30',
                      item.estado_stock === 'BAJO'    && 'bg-yellow-50/30',
                    )}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{item.nombre}</p>
                        {item.marca && <p className="text-xs text-muted-foreground">{item.marca}</p>}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.codigo_sku}</td>
                      <td className="px-4 py-3 text-muted-foreground">{item.categoria ?? '—'}</td>
                      <td className="px-4 py-3 text-right font-semibold">{item.disponible}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{item.reservado_total}</td>
                      <td className="px-4 py-3 text-right">{item.stock_total}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{item.stock_minimo}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>
                          {cfg.label}
                        </span>
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
            <span>Página {page} de {meta.last_page} — {meta.total} productos</span>
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
    </div>
  )
}

function KpiCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: number
  color: 'blue' | 'green' | 'yellow' | 'red'
}) {
  const bg = { blue: 'bg-blue-50', green: 'bg-green-50', yellow: 'bg-yellow-50', red: 'bg-red-50' }
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bg[color])}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  )
}
