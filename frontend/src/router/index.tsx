import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from '@/layouts/AppLayout'
import AuthLayout from '@/layouts/AuthLayout'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const wrap = (Component: React.LazyExoticComponent<() => JSX.Element | null>) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Component />
  </Suspense>
)

// Páginas lazy
const LoginPage          = lazy(() => import('@/features/auth/pages/LoginPage'))
const DashboardPage      = lazy(() => import('@/features/dashboard/pages/DashboardPage'))
const ProductosPage      = lazy(() => import('@/features/productos/pages/ProductosPage'))
const InventarioPage     = lazy(() => import('@/features/inventario/pages/InventarioPage'))
const KardexPage         = lazy(() => import('@/features/inventario/pages/KardexPage'))
const ComprasPage            = lazy(() => import('@/features/compras/pages/ComprasPage'))
const OrdenCompraDetailPage  = lazy(() => import('@/features/compras/pages/OrdenCompraDetailPage'))
const VentasPage         = lazy(() => import('@/features/ventas/pages/VentasPage'))
const VentaDetailPage    = lazy(() => import('@/features/ventas/pages/VentaDetailPage'))
const PedidosPage        = lazy(() => import('@/features/pedidos/pages/PedidosPage'))
const PedidoDetailPage   = lazy(() => import('@/features/ventas/pages/PedidoDetailPage'))
const CargasPage         = lazy(() => import('@/features/cargas/pages/CargasPage'))
const CargaDetailPage    = lazy(() => import('@/features/cargas/pages/CargaDetailPage'))
const DevolucionesPage   = lazy(() => import('@/features/devoluciones/pages/DevolucionesPage'))
const MermasPage         = lazy(() => import('@/features/mermas/pages/MermasPage'))
const AjustesPage        = lazy(() => import('@/features/ajustes/pages/AjustesPage'))
const ClientesPage       = lazy(() => import('@/features/clientes/pages/ClientesPage'))
const ClienteDetailPage  = lazy(() => import('@/features/clientes/pages/ClienteDetailPage'))
const RutasPage          = lazy(() => import('@/features/rutas/pages/RutasPage'))
const FlotaPage          = lazy(() => import('@/features/flota/pages/FlotaPage'))
const ReportesPage       = lazy(() => import('@/features/reportes/pages/ReportesPage'))

export const router = createBrowserRouter([
  // Auth
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: wrap(LoginPage) },
    ],
  },

  // App protegida
  {
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard',             element: wrap(DashboardPage) },
      { path: '/productos',             element: wrap(ProductosPage) },
      { path: '/inventario',            element: wrap(InventarioPage) },
      { path: '/inventario/kardex/:productoId', element: wrap(KardexPage) },
      { path: '/compras',               element: wrap(ComprasPage) },
      { path: '/compras/:ordenId',      element: wrap(OrdenCompraDetailPage) },
      { path: '/ventas',                element: wrap(VentasPage) },
      { path: '/ventas/:ventaId',       element: wrap(VentaDetailPage) },
      { path: '/pedidos',               element: wrap(PedidosPage) },
      { path: '/pedidos/:pedidoId',     element: wrap(PedidoDetailPage) },
      { path: '/cargas',                element: wrap(CargasPage) },
      { path: '/cargas/:cargaId',       element: wrap(CargaDetailPage) },
      { path: '/devoluciones',          element: wrap(DevolucionesPage) },
      { path: '/mermas',                element: wrap(MermasPage) },
      { path: '/ajustes',               element: wrap(AjustesPage) },
      { path: '/clientes',              element: wrap(ClientesPage) },
      { path: '/clientes/:clienteId',   element: wrap(ClienteDetailPage) },
      { path: '/rutas',                 element: wrap(RutasPage) },
      { path: '/flota',                 element: wrap(FlotaPage) },
      { path: '/reportes',              element: wrap(ReportesPage) },
    ],
  },

  // Fallback
  { path: '*', element: <Navigate to="/dashboard" replace /> },
])
