import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Trash2, Search } from 'lucide-react'
import apiClient from '@/api/client'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { LineaCarga } from '../types/carga.types'

interface Props {
  onSubmit: (data: any) => void
  isLoading?: boolean
  onCancel: () => void
}

const LINEA_VACIA: LineaCarga = {
  producto_id: 0, nombre_producto: '', sku_producto: '',
  cantidad: 1, precio_unitario: 0,
}

export default function CargaForm({ onSubmit, isLoading, onCancel }: Props) {
  const [rutaId,      setRutaId]      = useState<number | ''>('')
  const [vehiculoId,  setVehiculoId]  = useState<number | ''>('')
  const [usuarioId,   setUsuarioId]   = useState<number | ''>('')
  const [almacenId,   setAlmacenId]   = useState<number | ''>('')
  const [fechaCarga,  setFechaCarga]  = useState(new Date().toISOString().split('T')[0])
  const [notas,       setNotas]       = useState('')
  const [lineas,      setLineas]      = useState<LineaCarga[]>([{ ...LINEA_VACIA }])
  const [busqueda,    setBusqueda]    = useState('')
  const [lineaActiva, setLineaActiva] = useState<number | null>(null)

  const { data: rutasData }       = useQuery({ queryKey: ['rutas'],      queryFn: () => apiClient.get('/rutas').then(r => r.data.data) })
  const { data: vehiculosData }   = useQuery({ queryKey: ['vehiculos'],  queryFn: () => apiClient.get('/vehiculos').then(r => r.data.data) })
  const { data: repartidoresData }= useQuery({ queryKey: ['repartidores'], queryFn: () => apiClient.get('/repartidores').then(r => r.data.data) })
  const { data: almacenesData }   = useQuery({ queryKey: ['almacenes'],  queryFn: () => apiClient.get('/almacenes').then(r => r.data.data) })
  const { data: productosData }   = useQuery({
    queryKey: ['productos-search', busqueda],
    queryFn:  () => apiClient.get('/productos', { params: { search: busqueda, per_page: 10 } }).then(r => r.data),
    enabled:  busqueda.length >= 2,
  })

  const update = (i: number, field: keyof LineaCarga, val: any) =>
    setLineas(lineas.map((l, idx) => idx === i ? { ...l, [field]: val } : l))

  const seleccionar = (i: number, prod: any) => {
    const precios = Object.values(prod.precios ?? {}) as any[]
    const precio  = precios[0]?.precio ?? 0
    setLineas(lineas.map((l, idx) => idx === i
      ? { ...l, producto_id: prod.id, nombre_producto: prod.nombre, sku_producto: prod.codigo_sku, precio_unitario: precio }
      : l
    ))
    setLineaActiva(null)
    setBusqueda('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuarioId || !almacenId) return
    if (lineas.some(l => !l.producto_id || l.cantidad <= 0)) return

    onSubmit({
      ruta_id:     rutaId    || undefined,
      vehiculo_id: vehiculoId || undefined,
      usuario_id:  usuarioId,
      almacen_id:  almacenId,
      fecha_carga: fechaCarga,
      notas:       notas || undefined,
      detalles:    lineas.map(l => ({
        producto_id:     l.producto_id,
        cantidad:        l.cantidad,
        precio_unitario: l.precio_unitario,
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ruta</label>
          <select value={rutaId} onChange={e => setRutaId(Number(e.target.value) || '')}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Sin asignar —</option>
            {rutasData?.map((r: any) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
          <select value={vehiculoId} onChange={e => setVehiculoId(Number(e.target.value) || '')}
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Sin asignar —</option>
            {vehiculosData?.map((v: any) => <option key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.placa})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repartidor <span className="text-destructive">*</span>
          </label>
          <select value={usuarioId} onChange={e => setUsuarioId(Number(e.target.value) || '')} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Seleccionar —</option>
            {repartidoresData?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Almacén <span className="text-destructive">*</span>
          </label>
          <select value={almacenId} onChange={e => setAlmacenId(Number(e.target.value) || '')} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
            <option value="">— Seleccionar —</option>
            {almacenesData?.map((a: any) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de carga <span className="text-destructive">*</span>
          </label>
          <input type="date" value={fechaCarga} onChange={e => setFechaCarga(e.target.value)} required
            className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {/* Líneas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Productos a cargar</h3>
          <button type="button" disabled={isLoading}
            onClick={() => setLineas([...lineas, { ...LINEA_VACIA }])}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50">
            <Plus className="w-3.5 h-3.5" /> Agregar línea
          </button>
        </div>
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b text-xs font-medium text-muted-foreground uppercase">
                <th className="px-3 py-2 text-left w-2/5">Producto</th>
                <th className="px-3 py-2 text-right">Cantidad</th>
                <th className="px-3 py-2 text-right">Precio Unit.</th>
                <th className="px-3 py-2 text-right">Subtotal</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {lineas.map((l, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2 relative">
                    {l.producto_id ? (
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 text-xs">{l.nombre_producto}</p>
                          <p className="text-xs text-muted-foreground font-mono">{l.sku_producto}</p>
                        </div>
                        {!isLoading && (
                          <button type="button" onClick={() => update(i, 'producto_id', 0)}
                            className="text-muted-foreground hover:text-destructive p-0.5">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input type="text" placeholder="Buscar..."
                          value={lineaActiva === i ? busqueda : ''}
                          onFocus={() => setLineaActiva(i)}
                          onChange={e => setBusqueda(e.target.value)}
                          disabled={isLoading}
                          className="w-full pl-7 pr-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        {lineaActiva === i && productosData?.data?.length > 0 && (
                          <div className="absolute top-full left-0 right-0 z-20 bg-white border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto mt-0.5">
                            {productosData.data.map((p: any) => (
                              <button key={p.id} type="button" onClick={() => seleccionar(i, p)}
                                className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 border-b last:border-0">
                                <p className="font-medium">{p.nombre}</p>
                                <p className="text-muted-foreground font-mono">{p.codigo_sku}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0.001" step="0.001" value={l.cantidad} disabled={isLoading}
                      onChange={e => update(i, 'cantidad', Number(e.target.value))}
                      className="w-20 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-50" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="number" min="0" step="0.01" value={l.precio_unitario} disabled={isLoading}
                      onChange={e => update(i, 'precio_unitario', Number(e.target.value))}
                      className="w-24 text-right px-2 py-1 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 disabled:bg-gray-50" />
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-medium whitespace-nowrap">
                    {formatCurrency(l.cantidad * l.precio_unitario)}
                  </td>
                  <td className="px-2 py-2">
                    {!isLoading && lineas.length > 1 && (
                      <button type="button" onClick={() => setLineas(lineas.filter((_, idx) => idx !== i))}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end text-sm font-semibold">
          Total estimado: <span className="ml-2 text-gray-900">
            {formatCurrency(lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario, 0))}
          </span>
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
        <button type="submit" disabled={isLoading || !usuarioId || !almacenId}
          className={cn(
            'px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors',
            (isLoading || !usuarioId || !almacenId) && 'opacity-70 cursor-not-allowed',
          )}>
          {isLoading ? 'Guardando...' : 'Crear Carga'}
        </button>
      </div>
    </form>
  )
}
