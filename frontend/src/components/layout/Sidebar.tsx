import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Package, ClipboardList, ShoppingCart,
  TrendingUp, Truck, RotateCcw, Trash2, Settings,
  BarChart3, Users, ChevronLeft, ChevronRight, Box, MapPin
} from 'lucide-react'
import { useUiStore } from '@/store/uiStore'
import { usePermissions } from '@/hooks/usePermissions'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard, always: true },
  { to: '/productos',    label: 'Productos',    icon: Package,         always: true },
  { to: '/inventario',   label: 'Inventario',   icon: Box,             always: true },
  { to: '/clientes',     label: 'Clientes',     icon: Users,           permission: 'clientes.ver' },
  { to: '/rutas',        label: 'Rutas',        icon: MapPin,          permission: 'rutas.ver' },
  { to: '/flota',        label: 'Flota',        icon: Truck,           permission: 'vehiculos.ver' },
  { to: '/compras',      label: 'Compras',      icon: ShoppingCart,    permission: 'compras.ver' },
  { to: '/pedidos',      label: 'Pedidos',      icon: ClipboardList,   permission: 'pedidos.ver' },
  { to: '/ventas',       label: 'Ventas',       icon: TrendingUp,      permission: 'ventas.ver' },
  { to: '/cargas',       label: 'Cargas',       icon: Truck,           permission: 'cargas.ver' },
  { to: '/devoluciones', label: 'Devoluciones', icon: RotateCcw,       permission: 'devoluciones.ver' },
  { to: '/mermas',       label: 'Mermas',       icon: Trash2,          permission: 'mermas.ver' },
  { to: '/ajustes',      label: 'Ajustes',      icon: Settings,        permission: 'ajustes.ver' },
  { to: '/reportes',     label: 'Reportes',     icon: BarChart3,       permission: 'reportes.ver' },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUiStore()
  const { can } = usePermissions()

  const visibleItems = navItems.filter(item =>
    item.always || !item.permission || can(item.permission)
  )

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white border-r border-border flex flex-col',
      'transition-all duration-300 z-30',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border',
        sidebarCollapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Grupo HLS</p>
            <p className="text-xs text-muted-foreground">Inventario</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5',
              'text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button */}
      <div className="border-t border-border p-2">
        <button
          onClick={toggleSidebarCollapsed}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
            'text-muted-foreground hover:bg-gray-100 hover:text-gray-900',
            'text-sm transition-colors',
            sidebarCollapsed && 'justify-center'
          )}
        >
          {sidebarCollapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Colapsar</span></>
          }
        </button>
      </div>
    </aside>
  )
}
