import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react'
import { useKardex } from '../hooks/useInventario'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TIPO_CONFIG: Record<string, { label: string; signo: 1 | -1; color: string }> = {
  ENTRADA_COMPRA:    { label: 'Compra',       signo: 1,  color: 'text-green-600' },
  ENTRADA_AJUSTE:    { label: 'Ajuste +',     signo: 1,  color: 'text-green-500' },
  ENTRADA_DEVOLUCION:{ label: 'Devolución',   signo: 1,  color: 'text-blue-600'  },
  SALIDA_VENTA:      { label: 'Venta',        signo: -1, color: 'text-red-600'   },
  SALIDA_CARGA:      { label: 'Carga',        signo: -1, color: 'text-orange-600'},
  SALIDA_MERMA:      { label: 'Merma',        signo: -1, color: 'text-gray-600'  },
  SALIDA_AJUSTE:     { label: 'Ajuste −',     signo: -1, color: 'text-red-500'   },
  TRASLADO_SALIDA:   { label: 'Traslado −',   signo: -1, color: 'text-purple-600'},
  TRASLADO_ENTRADA:  { label: 'Traslado +',   signo: 1,  color: 'text-purple-500'},
}

export default function KardexPage() {
  const { productoId } = useParams<{ productoId: string }>()
  const id = Number(productoId)

  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [page, setPage]             = useState(1)

  const { data, isLoading } = useKardex(id, {
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    page,
    per_page: 50,
  })

  const movimientos = data?.data ?? []
  const meta        = data?.meta

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/inventario" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kardex de Producto</h1>
          <p className="text-sm text-muted-foreground">Historial de movimientos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
          <input type="date" value={fechaDesde} onChange={e => { setFechaDesde(e.target.value); setPage(1) }}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
          <input type="date" value={fechaHasta} onChange={e => { setFechaHasta(e.target.value); setPage(1) }}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        {meta?.saldo_inicial !== undefined && (
          <div className="sm:self-end bg-gray-50 rounded-lg px-4 py-2 text-sm">
            Saldo inicial: <span className="font-semibold">{meta.saldo_inicial}</span>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            Cargando movimientos...
          </div>
        ) : movimientos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Sin movimientos</p>
            <p className="text-sm">No hay registros para el período seleccionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Referencia</th>
                  <th className="px-4 py-3">Almacén</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movimientos.map((m: any) => {
                  const cfg = TIPO_CONFIG[m.tipo] ?? { label: m.tipo, signo: 1 as const, color: 'text-gray-600' }
                  const esEntrada = cfg.signo > 0
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {formatDateTime(m.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {esEntrada
                            ? <ArrowUp className="w-3 h-3 text-green-500 flex-shrink-0" />
                            : <ArrowDown className="w-3 h-3 text-red-500 flex-shrink-0" />
                          }
                          <span className={cn('font-medium', cfg.color)}>{cfg.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{m.referencia ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.almacen ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.usuario ?? '—'}</td>
                      <td className={cn('px-4 py-3 text-right font-semibold', cfg.color)}>
                        {esEntrada ? '+' : ''}{m.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">
                        {m.saldo_acumulado ?? '—'}
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
            <span>Página {page} de {meta.last_page} — {meta.total} movimientos</span>
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
