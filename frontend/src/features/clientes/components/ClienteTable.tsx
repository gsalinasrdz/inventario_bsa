import { Pencil, Trash2, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '@/lib/utils'
import { usePermissions } from '@/hooks/usePermissions'
import type { Cliente } from '../types/cliente.types'
import { cn } from '@/lib/utils'

interface Props {
  clientes:  Cliente[]
  isLoading: boolean
  onEdit:    (c: Cliente) => void
  onDelete:  (c: Cliente) => void
}

export default function ClienteTable({ clientes, isLoading, onEdit, onDelete }: Props) {
  const { can } = usePermissions()

  if (isLoading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded w-48" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (!clientes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Sin clientes</p>
        <p className="text-sm">Agregue el primer cliente con el botón de arriba.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Teléfono</th>
            <th className="px-4 py-3">Ruta</th>
            <th className="px-4 py-3 text-right">Saldo</th>
            <th className="px-4 py-3 text-right">Crédito</th>
            <th className="px-4 py-3 text-right">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {clientes.map(c => (
            <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{c.nombre}</p>
                <p className="text-xs text-muted-foreground font-mono">{c.codigo}</p>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{c.telefono ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{c.ruta?.nombre ?? '—'}</td>
              <td className={cn('px-4 py-3 text-right font-medium',
                c.saldo_pendiente > 0 ? 'text-red-600' : 'text-gray-700')}>
                {formatCurrency(c.saldo_pendiente)}
              </td>
              <td className="px-4 py-3 text-right text-muted-foreground">
                {formatCurrency(c.credito_limite)}
              </td>
              <td className="px-4 py-3 text-right">
                <span className={cn('text-xs font-medium', c.activo ? 'text-green-600' : 'text-gray-400')}>
                  {c.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Link to={`/clientes/${c.id}`}
                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Ver detalle">
                    <Eye className="w-4 h-4" />
                  </Link>
                  {can('clientes.editar') && (
                    <button onClick={() => onEdit(c)}
                      className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {can('clientes.eliminar') && (
                    <button onClick={() => onDelete(c)}
                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
