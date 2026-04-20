import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { productoSchema, type ProductoFormValues } from '../schemas/productoSchema'
import type { Producto } from '../types/producto.types'
import { cn } from '@/lib/utils'

interface Props {
  producto?: Producto
  onSubmit: (data: ProductoFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

function useSelectData() {
  const categorias   = useQuery({ queryKey: ['categorias'],   queryFn: () => apiClient.get('/categorias').then(r => r.data.data) })
  const marcas       = useQuery({ queryKey: ['marcas'],       queryFn: () => apiClient.get('/marcas').then(r => r.data.data) })
  const presentaciones = useQuery({ queryKey: ['presentaciones'], queryFn: () => apiClient.get('/presentaciones').then(r => r.data.data) })
  const proveedores  = useQuery({ queryKey: ['proveedores'],  queryFn: () => apiClient.get('/proveedores').then(r => r.data.data) })
  return { categorias, marcas, presentaciones, proveedores }
}

export default function ProductoForm({ producto, onSubmit, isLoading, onCancel }: Props) {
  const { categorias, marcas, presentaciones, proveedores } = useSelectData()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductoFormValues>({
    resolver: zodResolver(productoSchema),
    defaultValues: producto ? {
      codigo_sku:      producto.codigo_sku,
      codigo_barras:   producto.codigo_barras ?? '',
      nombre:          producto.nombre,
      descripcion:     producto.descripcion ?? '',
      categoria_id:    producto.categoria?.id,
      marca_id:        producto.marca?.id,
      presentacion_id: producto.presentacion?.id,
      proveedor_id:    producto.proveedor?.id,
      es_retornable:   producto.es_retornable,
      stock_minimo:    Number(producto.stock_minimo),
      stock_maximo:    producto.stock_maximo ? Number(producto.stock_maximo) : undefined,
      estado:          producto.estado,
    } : {
      es_retornable: false,
      stock_minimo: 0,
      estado: 'ACTIVO',
    },
  })

  const field = (name: string, label: string, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      <input
        type={type}
        step={type === 'number' ? '0.001' : undefined}
        {...register(name as any, type === 'number' ? { valueAsNumber: true } : {})}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          (errors as any)[name] ? 'border-destructive bg-destructive/5' : 'border-input'
        )}
        disabled={isLoading}
      />
      {(errors as any)[name] && (
        <p className="mt-1 text-xs text-destructive">{(errors as any)[name]?.message}</p>
      )}
    </div>
  )

  const selectField = (name: string, label: string, options: any[], required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-destructive ml-1">*</span>}
      </label>
      <select
        {...register(name as any, { valueAsNumber: true })}
        className={cn(
          'w-full px-3 py-2 border rounded-lg text-sm bg-white',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          (errors as any)[name] ? 'border-destructive' : 'border-input'
        )}
        disabled={isLoading}
      >
        <option value="">— Seleccionar —</option>
        {options?.map((o: any) => (
          <option key={o.id} value={o.id}>{o.nombre ?? o.razon_social}</option>
        ))}
      </select>
      {(errors as any)[name] && (
        <p className="mt-1 text-xs text-destructive">{(errors as any)[name]?.message}</p>
      )}
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {field('codigo_sku',   'Código SKU', 'text', true)}
        {field('codigo_barras','Código de Barras')}
        {field('nombre', 'Nombre del Producto', 'text', true)}
        {selectField('categoria_id',    'Categoría',     categorias.data ?? [],    true)}
        {selectField('marca_id',        'Marca',         marcas.data ?? [],        true)}
        {selectField('presentacion_id', 'Presentación',  presentaciones.data ?? [], true)}
        {selectField('proveedor_id',    'Proveedor',     proveedores.data ?? [])}
        {field('stock_minimo', 'Stock Mínimo', 'number', true)}
        {field('stock_maximo', 'Stock Máximo', 'number')}
        {field('peso_kg',     'Peso (kg)',    'number')}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          {...register('descripcion')}
          rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" {...register('es_retornable')} className="w-4 h-4 rounded" />
          <span>Envase retornable (casco)</span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            {...register('estado')}
            className="px-3 py-1.5 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading}
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            <option value="DESCONTINUADO">Descontinuado</option>
          </select>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-input rounded-lg hover:bg-gray-50 transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg',
            'hover:bg-primary/90 transition-colors font-medium',
            isLoading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isLoading
            ? 'Guardando...'
            : producto ? 'Actualizar Producto' : 'Crear Producto'
          }
        </button>
      </div>
    </form>
  )
}
