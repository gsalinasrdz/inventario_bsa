import { useState } from 'react'
import { Plus, Search, RefreshCw, AlertTriangle } from 'lucide-react'
import {
  useProductos,
  useCrearProducto,
  useActualizarProducto,
  useEliminarProducto,
  useStockBajo,
} from '../hooks/useProductos'
import ProductoTable from '../components/ProductoTable'
import ProductoForm from '../components/ProductoForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { useDebounce } from '@/hooks/useDebounce'
import type { Producto } from '../types/producto.types'
import type { ProductoFormValues } from '../schemas/productoSchema'

export default function ProductosPage() {
  const { can } = usePermissions()

  const [search,       setSearch]       = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [page,         setPage]         = useState(1)
  const debouncedSearch = useDebounce(search, 300)

  const [modalOpen,        setModalOpen]        = useState(false)
  const [editingProducto,  setEditingProducto]  = useState<Producto | null>(null)
  const [deleteTarget,     setDeleteTarget]     = useState<Producto | null>(null)

  const { data, isLoading, refetch } = useProductos({
    search:      debouncedSearch || undefined,
    estado:      estadoFilter || undefined,
    page,
  })

  const { data: stockBajoData } = useStockBajo()

  const crearMutation      = useCrearProducto()
  const actualizarMutation = useActualizarProducto()
  const eliminarMutation   = useEliminarProducto()

  const handleSubmit = async (values: ProductoFormValues) => {
    if (editingProducto) {
      await actualizarMutation.mutateAsync({ id: editingProducto.id, data: values })
    } else {
      await crearMutation.mutateAsync(values as any)
    }
    setModalOpen(false)
    setEditingProducto(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await eliminarMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const productos = data?.data ?? []
  const meta      = data?.meta
  const isSaving  = crearMutation.isPending || actualizarMutation.isPending

  return (
    <div className="space-y-5">
      {/* Alerta stock bajo */}
      {(stockBajoData?.length ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {stockBajoData!.length} producto(s) con stock bajo o agotado
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              {stockBajoData!.slice(0, 4).map(p => p.nombre).join(', ')}
              {stockBajoData!.length > 4 && ` y ${stockBajoData!.length - 4} más...`}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} productos registrados` : 'Gestión de catálogo de productos'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('productos.crear') && (
            <button
              onClick={() => { setEditingProducto(null); setModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar Producto
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o código de barras..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <select
          value={estadoFilter}
          onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
          <option value="DESCONTINUADO">Descontinuado</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <ProductoTable
          productos={productos}
          isLoading={isLoading}
          onEdit={p => { setEditingProducto(p); setModalOpen(true) }}
          onDelete={setDeleteTarget}
        />

        {/* Paginación */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Mostrando {meta.from}–{meta.to} de {meta.total}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40"
              >
                ‹ Anterior
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-40"
              >
                Siguiente ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
            </div>
            <div className="p-6">
              <ProductoForm
                producto={editingProducto ?? undefined}
                onSubmit={handleSubmit}
                isLoading={isSaving}
                onCancel={() => setModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Confirm Eliminar */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar Producto"
        description={`¿Seguro que desea eliminar "${deleteTarget?.nombre}"?`}
        confirmLabel="Sí, eliminar"
        isLoading={eliminarMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
