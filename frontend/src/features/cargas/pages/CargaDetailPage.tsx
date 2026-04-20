import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PlayCircle, XCircle, ClipboardCheck, Truck } from 'lucide-react'
import { useCarga, useIniciarCarga, useCancelarCarga, useLiquidarCarga } from '../hooks/useCargas'
import LiquidacionForm from '../components/LiquidacionForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const ESTADO_CFG = {
  PREPARACION: { label: 'Preparación', color: 'bg-gray-100 text-gray-700' },
  EN_RUTA:     { label: 'En ruta',     color: 'bg-blue-100 text-blue-700' },
  LIQUIDADA:   { label: 'Liquidada',   color: 'bg-green-100 text-green-700' },
  CANCELADA:   { label: 'Cancelada',   color: 'bg-red-100 text-red-600' },
}

export default function CargaDetailPage() {
  const { cargaId } = useParams<{ cargaId: string }>()
  const id = Number(cargaId)
  const { can } = usePermissions()

  const [iniciarDialog,    setIniciarDialog]    = useState(false)
  const [cancelDialog,     setCancelDialog]     = useState(false)
  const [liquidarModal,    setLiquidarModal]    = useState(false)

  const { data, isLoading } = useCarga(id)
  const iniciarMutation    = useIniciarCarga()
  const cancelarMutation   = useCancelarCarga()
  const liquidarMutation   = useLiquidarCarga()

  const carga = data?.data

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!carga) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Carga no encontrada</p>
        <Link to="/cargas" className="mt-2 text-sm text-primary hover:underline">Volver</Link>
      </div>
    )
  }

  const cfg          = ESTADO_CFG[carga.estado as keyof typeof ESTADO_CFG] ?? ESTADO_CFG.PREPARACION
  const canIniciar   = can('cargas.crear')    && carga.estado === 'PREPARACION'
  const canCancelar  = can('cargas.liquidar') && ['PREPARACION', 'EN_RUTA'].includes(carga.estado)
  const canLiquidar  = can('cargas.liquidar') && carga.estado === 'EN_RUTA'

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/cargas" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 font-mono">{carga.folio}</h1>
          <p className="text-sm text-muted-foreground">{carga.repartidor}</p>
        </div>
        <span className={cn('text-sm font-medium px-3 py-1 rounded-full', cfg.color)}>{cfg.label}</span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Ruta</p>
          <p className="font-semibold text-gray-900 mt-1">{carga.ruta ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Vehículo</p>
          <p className="font-semibold text-gray-900 mt-1 text-sm">{carga.vehiculo ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Almacén</p>
          <p className="font-semibold text-gray-900 mt-1">{carga.almacen ?? '—'}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Fecha</p>
          <p className="font-semibold text-gray-900 mt-1">{formatDate(carga.fecha_carga)}</p>
        </div>
      </div>

      {/* Acciones */}
      {(canIniciar || canLiquidar || canCancelar) && (
        <div className="flex flex-wrap gap-2">
          {canIniciar && (
            <button onClick={() => setIniciarDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <PlayCircle className="w-4 h-4" />
              Iniciar Ruta
            </button>
          )}
          {canLiquidar && (
            <button onClick={() => setLiquidarModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <ClipboardCheck className="w-4 h-4" />
              Liquidar Carga
            </button>
          )}
          {canCancelar && (
            <button onClick={() => setCancelDialog(true)}
              className="flex items-center gap-2 px-4 py-2 border border-destructive/40 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors">
              <XCircle className="w-4 h-4" />
              Cancelar
            </button>
          )}
        </div>
      )}

      {/* Productos */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <Truck className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-gray-900 text-sm">Productos cargados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-medium text-muted-foreground uppercase">
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-right">Cargado</th>
                <th className="px-4 py-3 text-right">Vendido</th>
                <th className="px-4 py-3 text-right">Devuelto</th>
                <th className="px-4 py-3 text-right">Precio Unit.</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {carga.detalles?.map((d: any) => (
                <tr key={d.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{d.producto?.nombre ?? '—'}</p>
                    <p className="text-xs text-muted-foreground font-mono">{d.producto?.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{d.cantidad_cargada}</td>
                  <td className="px-4 py-3 text-right font-medium text-green-600">{d.cantidad_vendida}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{d.cantidad_devuelta}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(d.precio_unitario)}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(d.cantidad_vendida * d.precio_unitario)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Liquidación */}
      {carga.liquidacion && (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="font-semibold text-gray-900 text-sm">Liquidación — {carga.liquidacion.folio}</h2>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="font-semibold">{formatDate(carga.liquidacion.fecha_liquidacion)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Efectivo esperado</p>
              <p className="font-semibold">{formatCurrency(carga.liquidacion.efectivo_esperado)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Efectivo recibido</p>
              <p className="font-semibold">{formatCurrency(carga.liquidacion.efectivo_recibido)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Diferencia</p>
              <p className={cn(
                'font-semibold',
                carga.liquidacion.diferencia >= 0 ? 'text-green-600' : 'text-destructive',
              )}>
                {carga.liquidacion.diferencia >= 0 ? '+' : ''}
                {formatCurrency(carga.liquidacion.diferencia)}
              </p>
            </div>
          </div>
          {carga.liquidacion.notas && (
            <div className="px-4 pb-4 text-sm text-muted-foreground">{carga.liquidacion.notas}</div>
          )}
        </div>
      )}

      {carga.notas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Notas</p>
          <p>{carga.notas}</p>
        </div>
      )}

      <ConfirmDialog
        open={iniciarDialog}
        title="Iniciar Ruta"
        description={`¿Iniciar la carga "${carga.folio}"? El stock será descontado del almacén.`}
        confirmLabel="Sí, iniciar"
        isLoading={iniciarMutation.isPending}
        onConfirm={async () => { await iniciarMutation.mutateAsync(id); setIniciarDialog(false) }}
        onCancel={() => setIniciarDialog(false)}
      />

      <ConfirmDialog
        open={cancelDialog}
        title="Cancelar Carga"
        description={`¿Cancelar la carga "${carga.folio}"?${carga.estado === 'EN_RUTA' ? ' El stock será revertido.' : ''}`}
        confirmLabel="Sí, cancelar"
        variant="warning"
        isLoading={cancelarMutation.isPending}
        onConfirm={async () => { await cancelarMutation.mutateAsync(id); setCancelDialog(false) }}
        onCancel={() => setCancelDialog(false)}
      />

      {/* Modal Liquidar */}
      {liquidarModal && carga.detalles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setLiquidarModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Liquidar Carga — {carga.folio}</h2>
            </div>
            <div className="p-6">
              <LiquidacionForm
                cargaId={id}
                detalles={carga.detalles}
                onSubmit={async (formData) => {
                  await liquidarMutation.mutateAsync({ id, data: formData })
                  setLiquidarModal(false)
                }}
                isLoading={liquidarMutation.isPending}
                onCancel={() => setLiquidarModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
