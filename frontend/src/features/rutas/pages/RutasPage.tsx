import { useState } from 'react'
import { Plus, RefreshCw, MapPin, Users, Truck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import apiClient from '@/api/client'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

interface Ruta {
  id: number
  nombre: string
  descripcion: string | null
  dia_visita: string | null
  activo: boolean
  zona: { id: number; nombre: string } | null
  vehiculo: { id: number; placa: string } | null
  repartidor: { id: number; name: string } | null
  clientes_count: number
}

export default function RutasPage() {
  const { can } = usePermissions()
  const qc = useQueryClient()

  const [modalOpen,     setModalOpen]     = useState(false)
  const [editingRuta,   setEditingRuta]   = useState<Ruta | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<Ruta | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['rutas'],
    queryFn: () => apiClient.get('/rutas').then(r => r.data.data as Ruta[]),
  })

  const { data: vehiculosData } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: () => apiClient.get('/vehiculos').then(r => r.data.data),
  })

  const crearMutation = useMutation({
    mutationFn: (data: any) => editingRuta
      ? apiClient.put(`/rutas/${editingRuta.id}`, data).then(r => r.data)
      : apiClient.post('/rutas', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      toast.success(editingRuta ? 'Ruta actualizada.' : 'Ruta creada.')
      setModalOpen(false)
      setEditingRuta(null)
      reset()
    },
  })

  const eliminarMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/rutas/${id}`).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rutas'] })
      toast.success('Ruta eliminada.')
      setDeleteTarget(null)
    },
  })

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { nombre: '', descripcion: '', vehiculo_id: '', repartidor_id: '', dia_visita: '', activo: true },
  })

  const openCreate = () => { setEditingRuta(null); reset(); setModalOpen(true) }
  const openEdit   = (r: Ruta) => {
    setEditingRuta(r)
    setValue('nombre', r.nombre)
    setValue('descripcion', r.descripcion ?? '')
    setValue('vehiculo_id', r.vehiculo?.id?.toString() ?? '')
    setValue('repartidor_id', r.repartidor?.id?.toString() ?? '')
    setValue('dia_visita', r.dia_visita ?? '')
    setValue('activo', r.activo)
    setModalOpen(true)
  }

  const rutas = data ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
          <p className="text-sm text-muted-foreground">{rutas.length} rutas de distribución</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('rutas.crear') && (
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Nueva Ruta
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : rutas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white rounded-xl border border-border">
          <MapPin className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-lg font-medium">Sin rutas</p>
          <p className="text-sm">Cree la primera ruta de distribución.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rutas.map(r => (
            <div key={r.id} className={cn(
              'bg-white rounded-xl border p-5 transition-shadow hover:shadow-md',
              r.activo ? 'border-border' : 'border-gray-200 opacity-60',
            )}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.nombre}</h3>
                  {r.zona && <p className="text-xs text-muted-foreground">{r.zona.nombre}</p>}
                </div>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full',
                  r.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {r.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  <span>{r.clientes_count} clientes</span>
                </div>
                {r.vehiculo && (
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{r.vehiculo.placa}</span>
                  </div>
                )}
                {r.repartidor && (
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 text-center text-xs">👤</span>
                    <span>{r.repartidor.name}</span>
                  </div>
                )}
                {r.dia_visita && <p className="text-xs">Visita: {r.dia_visita}</p>}
              </div>

              {(can('rutas.editar') || can('rutas.eliminar')) && (
                <div className="flex gap-2 pt-3 border-t">
                  {can('rutas.editar') && (
                    <button onClick={() => openEdit(r)}
                      className="flex-1 text-xs py-1.5 border border-input rounded hover:bg-gray-50 transition-colors">
                      Editar
                    </button>
                  )}
                  {can('rutas.eliminar') && r.clientes_count === 0 && (
                    <button onClick={() => setDeleteTarget(r)}
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
              <h2 className="text-lg font-semibold">{editingRuta ? 'Editar Ruta' : 'Nueva Ruta'}</h2>
            </div>
            <form onSubmit={handleSubmit(d => crearMutation.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-destructive">*</span></label>
                <input {...register('nombre', { required: true })}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input {...register('descripcion')}
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
                <select {...register('vehiculo_id')} className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">— Sin asignar —</option>
                  {vehiculosData?.map((v: any) => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día de visita</label>
                <input {...register('dia_visita')} placeholder="Ej: Lunes, Miércoles..."
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" {...register('activo')} className="w-4 h-4 rounded" />
                <span>Ruta activa</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={crearMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium disabled:opacity-70">
                  {crearMutation.isPending ? 'Guardando...' : editingRuta ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Ruta"
        description={`¿Seguro que desea eliminar la ruta "${deleteTarget?.nombre}"?`}
        confirmLabel="Sí, eliminar"
        isLoading={eliminarMutation.isPending}
        onConfirm={() => deleteTarget && eliminarMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
