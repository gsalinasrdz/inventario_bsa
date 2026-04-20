import { useState } from 'react'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { useClientes, useCrearCliente, useActualizarCliente, useEliminarCliente } from '../hooks/useClientes'
import ClienteTable from '../components/ClienteTable'
import ClienteForm from '../components/ClienteForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import { usePermissions } from '@/hooks/usePermissions'
import { useDebounce } from '@/hooks/useDebounce'
import type { Cliente } from '../types/cliente.types'
import type { ClienteFormValues } from '../schemas/clienteSchema'

export default function ClientesPage() {
  const { can } = usePermissions()

  const [search,          setSearch]          = useState('')
  const [page,            setPage]            = useState(1)
  const [modalOpen,       setModalOpen]       = useState(false)
  const [editingCliente,  setEditingCliente]  = useState<Cliente | null>(null)
  const [deleteTarget,    setDeleteTarget]    = useState<Cliente | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading, refetch } = useClientes({
    search:   debouncedSearch || undefined,
    page,
    per_page: 25,
  })

  const crearMutation      = useCrearCliente()
  const actualizarMutation = useActualizarCliente()
  const eliminarMutation   = useEliminarCliente()

  const handleSubmit = async (values: ClienteFormValues) => {
    if (editingCliente) {
      await actualizarMutation.mutateAsync({ id: editingCliente.id, data: values })
    } else {
      await crearMutation.mutateAsync(values)
    }
    setModalOpen(false)
    setEditingCliente(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    await eliminarMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const clientes = data?.data ?? []
  const meta     = data?.meta
  const isSaving = crearMutation.isPending || actualizarMutation.isPending

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-muted-foreground">
            {meta ? `${meta.total} clientes registrados` : 'Gestión de cartera de clientes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()}
            className="p-2 text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar">
            <RefreshCw className="w-4 h-4" />
          </button>
          {can('clientes.crear') && (
            <button
              onClick={() => { setEditingCliente(null); setModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Agregar Cliente
            </button>
          )}
        </div>
      </div>

      {/* Filtro */}
      <div className="bg-white rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, código o teléfono..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <ClienteTable
          clientes={clientes}
          isLoading={isLoading}
          onEdit={c => { setEditingCliente(c); setModalOpen(true) }}
          onDelete={setDeleteTarget}
        />

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
            <span>Mostrando {meta.from}–{meta.to} de {meta.total}</span>
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

      {/* Modal CRUD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h2>
            </div>
            <div className="p-6">
              <ClienteForm
                cliente={editingCliente ?? undefined}
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
        title="Eliminar Cliente"
        description={`¿Seguro que desea eliminar a "${deleteTarget?.nombre}"?`}
        confirmLabel="Sí, eliminar"
        isLoading={eliminarMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
