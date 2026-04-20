import { useState } from 'react'
import { Plus, RefreshCw, Truck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import apiClient from '@/api/client'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  capacidad_cajas: number
  activo: boolean
  notas: string | null
}

export default function FlotaPage() {
  const { can } = usePermissions()
  const qc = useQueryClient()

  const [modalOpen,    setModalOpen]    = useState(false)
  const [editing,      setEditing]      = useState<Vehiculo | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Vehiculo | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => apiClient.get('/vehiculos').then(r => r.data.data as Vehiculo[]),
  })

  const saveMutation = useMutation({
    mutationFn: (formData: any) => editing
      ? apiClient.put(`/vehiculos/${editing.id}`, formData).then(r => r.data)
      : apiClient.post('/vehiculos', formData).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehiculos'] })
      toast.success(editing ? 'Vehículo actualizado.' : 'Vehículo registrado.')
      setModalOpen(false)
      setEditing(null)
      reset()
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/vehiculos/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehiculos'] })
      toast.success('Vehículo eliminado.')
      setDeleteTarget(null)
    },
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { placa: '', marca: '', modelo: '', anio: new Date().getFullYear(), capacidad_cajas: 0, activo: true, notas: '' },
  })

  const openCreate = () => { setEditing(null); reset(); setModalOpen(true) }
  const openEdit   = (v: Vehiculo) => {
    setEditing(v)
    setValue('placa', v.placa)
    setValue('marca', v.marca)
    setValue('modelo', v.modelo)
    setValue('anio', v.anio)
    setValue('capacidad_cajas', v.capacidad_cajas)
    setValue('activo', v.activo)
    setValue('notas', v.notas ?? '')
    setModalOpen(true)
  }

  const vehiculos = data ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flota de Vehículos</h1>
          <p className="text-sm text-muted-foreground">{vehiculos.length} vehículos registrados</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('vehiculos.crear') && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Registrar Vehículo
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white rounded-xl border border-border">
          <Truck className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-lg font-medium">Sin vehículos</p>
          <p className="text-sm">Registre el primer vehículo de la flota.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehiculos.map(v => (
            <div key={v.id} className={cn(
              'bg-white rounded-xl border p-5 transition-shadow hover:shadow-md',
              v.activo ? 'border-border' : 'border-gray-200 opacity-60',
            )}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', v.activo ? 'bg-blue-50' : 'bg-gray-100')}>
                    <Truck className={cn('w-5 h-5', v.activo ? 'text-blue-600' : 'text-gray-400')} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 font-mono">{v.placa}</p>
                    <p className="text-xs text-muted-foreground">{v.marca} {v.modelo} {v.anio}</p>
                  </div>
                </div>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                  v.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {v.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                Capacidad: <span className="font-medium text-gray-700">{v.capacidad_cajas} cajas</span>
              </p>

              {(can('vehiculos.editar') || can('vehiculos.eliminar')) && (
                <div className="flex gap-2 pt-3 border-t">
                  {can('vehiculos.editar') && (
                    <button onClick={() => openEdit(v)}
                      className="flex-1 text-xs py-1.5 border border-input rounded hover:bg-gray-50 transition-colors">
                      Editar
                    </button>
                  )}
                  {can('vehiculos.eliminar') && (
                    <button onClick={() => setDeleteTarget(v)}
                      className="flex-1 text-xs py-1.5 border border-destructive/40 text-destructive rounded hover:bg-destructive/5 transition-colors">
                      Eliminar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">{editing ? 'Editar Vehículo' : 'Registrar Vehículo'}</h2>
            </div>
            <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Placa <span className="text-destructive">*</span></label>
                  <input {...register('placa', { required: true })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año <span className="text-destructive">*</span></label>
                  <input type="number" {...register('anio', { required: true, valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marca <span className="text-destructive">*</span></label>
                  <input {...register('marca', { required: true })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modelo <span className="text-destructive">*</span></label>
                  <input {...register('modelo', { required: true })}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad (cajas) <span className="text-destructive">*</span></label>
                <input type="number" {...register('capacidad_cajas', { required: true, valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea {...register('notas')} rows={2}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('activo')} className="w-4 h-4 rounded" />
                <span>Vehículo activo</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={saveMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-70">
                  {saveMutation.isPending ? 'Guardando...' : editing ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Vehículo"
        description={`¿Seguro que desea eliminar el vehículo "${deleteTarget?.placa}"?`}
        confirmLabel="Sí, eliminar"
        isLoading={eliminarMutation.isPending}
        onConfirm={() => deleteTarget && eliminarMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
