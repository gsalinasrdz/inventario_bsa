import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { clienteSchema, type ClienteFormValues } from '../schemas/clienteSchema'
import type { Cliente } from '../types/cliente.types'
import { cn } from '@/lib/utils'

interface Props {
  cliente?: Cliente
  onSubmit: (data: ClienteFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

function useSelectData() {
  const rutas  = useQuery({ queryKey: ['rutas'],  queryFn: () => apiClient.get('/rutas').then(r => r.data.data) })
  const zonas  = useQuery({ queryKey: ['zonas'],  queryFn: () => apiClient.get('/zonas').then(r => r.data.data) })
  const listas = useQuery({ queryKey: ['listas'], queryFn: () => apiClient.get('/listas-precios').then(r => r.data.data) })
  return { rutas, zonas, listas }
}

export default function ClienteForm({ cliente, onSubmit, isLoading, onCancel }: Props) {
  const { rutas, zonas, listas } = useSelectData()

  const { register, handleSubmit, formState: { errors } } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? {
      codigo:          cliente.codigo,
      nombre:          cliente.nombre,
      rfc:             cliente.rfc ?? '',
      telefono:        cliente.telefono ?? '',
      email:           cliente.email ?? '',
      direccion:       cliente.direccion ?? '',
      colonia:         cliente.colonia ?? '',
      municipio:       cliente.municipio ?? '',
      estado:          cliente.estado ?? '',
      cp:              cliente.cp ?? '',
      ruta_id:         cliente.ruta?.id,
      zona_id:         cliente.zona?.id,
      lista_precio_id: cliente.lista_precio?.id,
      credito_limite:  cliente.credito_limite,
      credito_dias:    cliente.credito_dias,
      activo:          cliente.activo,
      notas:           cliente.notas ?? '',
    } : {
      activo:         true,
      credito_limite: 0,
      credito_dias:   0,
    },
  })

  const field = (name: keyof ClienteFormValues, label: string, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        step={type === 'number' ? '0.01' : undefined}
        {...register(name, type === 'number' ? { valueAsNumber: true } : {})}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          errors[name] ? 'border-destructive bg-destructive/5' : 'border-input',
        )}
        disabled={isLoading}
      />
      {errors[name] && <p className="mt-1 text-xs text-destructive">{errors[name]?.message as string}</p>}
    </div>
  )

  const selectField = (name: keyof ClienteFormValues, label: string, options: any[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        {...register(name, { valueAsNumber: true })}
        className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        disabled={isLoading}
      >
        <option value="">— Sin asignar —</option>
        {options?.map((o: any) => (
          <option key={o.id} value={o.id}>{o.nombre}</option>
        ))}
      </select>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Datos básicos */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b">Datos del Cliente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('codigo', 'Código', 'text', true)}
          {field('nombre', 'Nombre / Razón Social', 'text', true)}
          {field('rfc', 'RFC')}
          {field('telefono', 'Teléfono')}
          {field('email', 'Email')}
        </div>
      </div>

      {/* Dirección */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b">Dirección</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('direccion', 'Calle y número')}
          {field('colonia', 'Colonia')}
          {field('municipio', 'Municipio / Ciudad')}
          {field('estado', 'Estado')}
          {field('cp', 'Código Postal')}
        </div>
      </div>

      {/* Asignación y crédito */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-1 border-b">Asignación y Crédito</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {selectField('ruta_id', 'Ruta', rutas.data ?? [])}
          {selectField('zona_id', 'Zona', zonas.data ?? [])}
          {selectField('lista_precio_id', 'Lista de Precio', listas.data ?? [])}
          {field('credito_limite', 'Límite de Crédito ($)', 'number')}
          {field('credito_dias', 'Días de Crédito', 'number')}
        </div>
      </div>

      {/* Estado y notas */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('activo')} className="w-4 h-4 rounded" />
          <span>Cliente activo</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea {...register('notas')} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          disabled={isLoading} />
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="button" onClick={onCancel} disabled={isLoading}
          className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium',
            isLoading && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Guardando...' : cliente ? 'Actualizar Cliente' : 'Crear Cliente'}
        </button>
      </div>
    </form>
  )
}
