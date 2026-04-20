export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN:  '/auth/login',
    LOGOUT: '/auth/logout',
    ME:     '/auth/me',
  },

  // Catálogos
  CATEGORIAS:     '/categorias',
  MARCAS:         '/marcas',
  PRESENTACIONES: '/presentaciones',
  ALMACENES:      '/almacenes',
  LISTAS_PRECIOS: '/listas-precios',
  PROVEEDORES:    '/proveedores',
  RUTAS:          '/rutas',
  ZONAS:          '/zonas',
  VEHICULOS:      '/vehiculos',
  REPARTIDORES:   '/repartidores',

  // Productos
  PRODUCTOS:       '/productos',
  STOCK_BAJO:      '/productos/stock-bajo',

  // Inventario
  INVENTARIO: {
    STOCK:       '/inventario/stock',
    MOVIMIENTOS: '/inventario/movimientos',
    KARDEX:      '/inventario/kardex',
  },

  // Clientes
  CLIENTES: '/clientes',

  // Operaciones
  ORDENES_COMPRA: '/ordenes-compra',
  RECEPCIONES:    '/recepciones',
  PEDIDOS:        '/pedidos',
  VENTAS:         '/ventas',
  CARGAS:         '/cargas',
  DEVOLUCIONES:   '/devoluciones',
  MERMAS:         '/mermas',
  AJUSTES:        '/ajustes',

  // Envases
  ENVASES: {
    MOVIMIENTOS: '/envases/movimientos',
    SALDOS:      '/envases/saldos',
  },

  // Reportes
  REPORTES: {
    DASHBOARD:        '/reportes/dashboard',
    VENTAS:           '/reportes/ventas',
    INVENTARIO:       '/reportes/inventario',
    CARGAS:           '/reportes/cargas',
    MERMAS:           '/reportes/mermas',
    CLIENTES_DEUDA:   '/reportes/clientes-deuda',
    ENVASES:          '/reportes/envases',
    EXPORTAR:         '/reportes/exportar',
  },

  // Admin
  USUARIOS:  '/usuarios',
  AUDIT_LOG: '/audit-log',
} as const
