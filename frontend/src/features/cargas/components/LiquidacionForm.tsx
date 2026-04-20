import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DetalleCarga } from '../types/carga.types'

interface Props {
  cargaId: number
  detalles: DetalleCarga[]
  onSubmit: (data: any) => void
  isLoading?: boolean
  onCancel: () => void
}

export default function LiquidacionForm({ detalles, onSubmit, isLoading, onCancel }: Props) {
  const [efectivoRecibido, setEfectivoRecibido] = useState(0)
  const [notas,            setNotas]            = useState('')
  const [devueltos, setDevueltos] = useState<Record<number, number>>(
    Object.fromEntries(detalles.map(d => [d.producto_id, 0]))
  )

  const efectivoEsperado = detalles.reduce((sum, d) => {
    const vendida = Math.max(0, d.cantidad_cargada - (devueltos[d.producto_id] ?? 0))
    return sum + vendida * d.precio_unitario
  }, 0)

  const diferencia = efectivoRecibido - efectivoEsperado

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    for (const d of detalles) {
      const dev = devueltos[d.producto_id] ?? 0
      if (dev > d.cantidad_cargada) return
    }

    onSubmit({
      efectivo_recibido: efectivoRecibido,
      notas: notas || undefined,
      detalles: detalles.map(d => ({
        producto_id:      d.producto_id,
        cantidad_devuelta: devueltos[d.producto_id] ?? 0,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tabla de productos */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-medium text-muted-foreground uppercase">
              <th className="px-3 py-2 text-left">Producto</th>
              <th className="px-3 py-2 text-right">Cargado</th>
              <th className="px-3 py-2 text-right">Devuelto</th>
              <th className="px-3 py-2 text-right">Vendido</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {detalles.map(d => {
              const devuelta = devueltos[d.producto_id] ?? 0
              const vendida  = Math.max(0, d.cantidad_cargada - devuelta)
              const subtotal = vendida * d.precio_unitario
              const excede   = devuelta > d.cantidad_cargada
              return (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    <p className="font-medium text-gray-900 text-xs">{d.producto?.nombre ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.producto?.sku}</p>
                  </td>
                  <td className="px-3 py-2 text-right text-xs">{d.cantidad_cargada}</td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" max={d.cantidad_cargada} step="0.001"
                      value={devuelta}
                      onChange={e => setDevueltos({ ...devueltos, [d.producto_id]: Number(e.target.value) })}
                      disabled={isLoading}
                      className={cn(
                        'w-20 text-right px-2 py-1 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-50',
                        excede ? 'border-destructive' : 'border-input',
                      )}
                    />
                    {excede && <p className="text-xs text-destructive mt-0.5">Excede cargado</p>}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium">{vendida.toFixed(3)}</td>
                  <td className="px-3 py-2 text-right text-xs font-medium">{formatCurrency(subtotal)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t bg-gray-50">
              <td colSpan={4} className="px-3 py-2 text-right text-xs text-muted-foreground font-semibold">
                Efectivo esperado:
              </td>
              <td className="px-3 py-2 text-right text-xs font-semibold text-gray-900">
                {formatCurrency(efectivoEsperado)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Efectivo recibido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Efectivo recibido <span className="text-destructive">*</span>
          </label>
          <input type="number" min="0" step="0.01" value={efectivoRecibido} required
            onChange={e => setEfectivoRecibido(Number(e.target.value))}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex items-end pb-2">
          <div className={cn(
            'text-sm font-semibold',
            diferencia >= 0 ? 'text-green-600' : 'text-destructive',
          )}>
            Diferencia: {diferencia >= 0 ? '+' : ''}{formatCurrency(diferencia)}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} disabled={isLoading}
          className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors',
            isLoading && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Procesando...' : 'Confirmar Liquidación'}
        </button>
      </div>
    </form>
  )
}
