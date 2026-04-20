import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, Mail, MapPin, Package } from 'lucide-react'
import { useCliente, useEstadoCuenta } from '../hooks/useClientes'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function ClienteDetailPage() {
  const { clienteId } = useParams<{ clienteId: string }>()
  const id = Number(clienteId)

  const { data: clienteData, isLoading } = useCliente(id)
  const { data: cuentaData }             = useEstadoCuenta(id)

  const cliente = clienteData?.data
  const cuenta  = cuentaData?.data

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Cliente no encontrado</p>
        <Link to="/clientes" className="mt-2 text-sm text-primary hover:underline">Volver a clientes</Link>
      </div>
    )
  }

  const creditoUsado   = cuenta ? cuenta.credito_limite - cuenta.credito_disponible : 0
  const creditoPct     = cuenta?.credito_limite > 0
    ? Math.min(100, (creditoUsado / cuenta.credito_limite) * 100) : 0

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/clientes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{cliente.nombre}</h1>
          <p className="text-sm text-muted-foreground font-mono">{cliente.codigo}</p>
        </div>
        <span className={cn(
          'ml-auto text-xs font-medium px-2.5 py-1 rounded-full',
          cliente.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
        )}>
          {cliente.activo ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Info contacto */}
        <div className="bg-white rounded-xl border border-border p-5 space-y-3">
          <h2 className="font-semibold text-gray-900 mb-4">Información de Contacto</h2>

          {cliente.telefono && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{cliente.telefono}</span>
            </div>
          )}
          {cliente.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{cliente.email}</span>
            </div>
          )}
          {(cliente.direccion || cliente.colonia) && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                {cliente.direccion && <p>{cliente.direccion}</p>}
                {cliente.colonia && <p>{cliente.colonia}</p>}
                {(cliente.municipio || cliente.estado) && (
                  <p className="text-muted-foreground">{[cliente.municipio, cliente.estado, cliente.cp].filter(Boolean).join(', ')}</p>
                )}
              </div>
            </div>
          )}
          {cliente.rfc && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground w-4 text-center font-mono text-xs">RFC</span>
              <span className="font-mono">{cliente.rfc}</span>
            </div>
          )}

          <div className="pt-2 border-t space-y-1 text-sm text-muted-foreground">
            {cliente.ruta && <p>Ruta: <span className="text-gray-700 font-medium">{cliente.ruta.nombre}</span></p>}
            {cliente.zona && <p>Zona: <span className="text-gray-700 font-medium">{cliente.zona.nombre}</span></p>}
            {cliente.lista_precio && <p>Lista: <span className="text-gray-700 font-medium">{cliente.lista_precio.nombre}</span></p>}
          </div>
        </div>

        {/* Estado de cuenta */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Estado de Cuenta</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Saldo Pendiente</p>
              <p className={cn('text-xl font-bold', cuenta?.saldo_pendiente > 0 ? 'text-red-600' : 'text-green-600')}>
                {formatCurrency(cuenta?.saldo_pendiente ?? cliente.saldo_pendiente)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Crédito Disponible</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(cuenta?.credito_disponible ?? 0)}
              </p>
            </div>
          </div>

          {cuenta?.credito_limite > 0 && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Uso de crédito</span>
                <span>{Math.round(creditoPct)}% — {formatCurrency(creditoUsado)} / {formatCurrency(cuenta.credito_limite)}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', creditoPct > 80 ? 'bg-red-500' : creditoPct > 50 ? 'bg-yellow-500' : 'bg-green-500')}
                  style={{ width: `${creditoPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{cuenta.credito_dias} días de crédito</p>
            </div>
          )}

          {/* Envases */}
          {cuenta?.envases && cuenta.envases.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-gray-700">Envases Retornables</h3>
              </div>
              <div className="space-y-2">
                {cuenta.envases.map((e: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{e.tipo}</span>
                    <div className="flex gap-4 text-xs">
                      <span>Prestados: <b>{e.prestados}</b></span>
                      <span>Devueltos: <b>{e.devueltos}</b></span>
                      <span className={cn('font-semibold', e.saldo > 0 ? 'text-orange-600' : 'text-green-600')}>
                        Saldo: {e.saldo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {cliente.notas && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Notas</p>
          <p>{cliente.notas}</p>
        </div>
      )}
    </div>
  )
}
