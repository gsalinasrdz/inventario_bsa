<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Sistema de Inventario Grupo HLS
|--------------------------------------------------------------------------
| Prefijo base: /api/v1 (configurado en bootstrap/app.php)
| Auth: Laravel Sanctum SPA (cookies httpOnly + CSRF)
*/

// ── AUTH (rutas públicas) ────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:login')
        ->name('auth.login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('auth.me');
    });
});

// ── RUTAS PROTEGIDAS ────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Usuarios (solo ADMIN)
    Route::middleware('role:ADMIN')->prefix('usuarios')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\UsuarioController::class, 'index']);
        Route::post('/', [\App\Http\Controllers\Api\V1\UsuarioController::class, 'store']);
        Route::get('/{usuario}', [\App\Http\Controllers\Api\V1\UsuarioController::class, 'show']);
        Route::put('/{usuario}', [\App\Http\Controllers\Api\V1\UsuarioController::class, 'update']);
        Route::delete('/{usuario}', [\App\Http\Controllers\Api\V1\UsuarioController::class, 'destroy']);
        Route::patch('/{usuario}/toggle-activo', [\App\Http\Controllers\Api\V1\UsuarioController::class, 'toggleActivo']);
    });

    // Catálogos — lectura para todos, escritura solo ADMIN|GERENTE
    Route::get('categorias',     [\App\Http\Controllers\Api\V1\CategoriaController::class,    'index']);
    Route::get('marcas',         [\App\Http\Controllers\Api\V1\MarcaController::class,         'index']);
    Route::get('presentaciones', [\App\Http\Controllers\Api\V1\PresentacionController::class,  'index']);
    Route::get('listas-precios', [\App\Http\Controllers\Api\V1\ListaPrecioController::class,   'index']);
    Route::get('almacenes',      [\App\Http\Controllers\Api\V1\AlmacenController::class,       'index']);
    Route::get('zonas',          [\App\Http\Controllers\Api\V1\ZonaController::class,          'index']);
    Route::get('rutas',          [\App\Http\Controllers\Api\V1\RutaController::class,          'index']);
    Route::get('proveedores',    [\App\Http\Controllers\Api\V1\ProveedorController::class,     'index']);

    Route::middleware('role:ADMIN|GERENTE')->group(function () {
        Route::apiResource('categorias',    \App\Http\Controllers\Api\V1\CategoriaController::class)->except(['index']);
        Route::apiResource('marcas',        \App\Http\Controllers\Api\V1\MarcaController::class)->except(['index']);
        Route::apiResource('presentaciones',\App\Http\Controllers\Api\V1\PresentacionController::class)->except(['index']);
        Route::apiResource('unidades-medida',\App\Http\Controllers\Api\V1\UnidadMedidaController::class);
        Route::apiResource('tipos-envase',  \App\Http\Controllers\Api\V1\TipoEnvaseController::class);
        Route::apiResource('listas-precios',\App\Http\Controllers\Api\V1\ListaPrecioController::class)->except(['index']);
        Route::apiResource('almacenes',     \App\Http\Controllers\Api\V1\AlmacenController::class)->except(['index']);
        Route::apiResource('zonas',         \App\Http\Controllers\Api\V1\ZonaController::class)->except(['index']);
        Route::apiResource('proveedores',   \App\Http\Controllers\Api\V1\ProveedorController::class)->except(['index']);
    });

    // Productos
    Route::apiResource('productos', \App\Http\Controllers\Api\V1\ProductoController::class);
    Route::post('productos/{producto}/imagenes', [\App\Http\Controllers\Api\V1\ProductoImagenController::class, 'store']);
    Route::delete('productos/{producto}/imagenes/{imagen}', [\App\Http\Controllers\Api\V1\ProductoImagenController::class, 'destroy']);
    Route::get('productos/{producto}/precios', [\App\Http\Controllers\Api\V1\ProductoPrecioController::class, 'index']);
    Route::put('productos/{producto}/precios', [\App\Http\Controllers\Api\V1\ProductoPrecioController::class, 'sync']);
    Route::get('productos/stock-bajo', [\App\Http\Controllers\Api\V1\ProductoController::class, 'stockBajo']);

    // Inventario
    Route::prefix('inventario')->group(function () {
        Route::get('/stock/resumen', [\App\Http\Controllers\Api\V1\StockController::class, 'resumen']);
        Route::get('/stock', [\App\Http\Controllers\Api\V1\StockController::class, 'index']);
        Route::get('/stock/{productoId}', [\App\Http\Controllers\Api\V1\StockController::class, 'show']);
        Route::get('/movimientos', [\App\Http\Controllers\Api\V1\MovimientoInventarioController::class, 'index']);
        Route::get('/kardex/{productoId}', [\App\Http\Controllers\Api\V1\MovimientoInventarioController::class, 'kardex']);
    });

    // Clientes
    Route::apiResource('clientes', \App\Http\Controllers\Api\V1\ClienteController::class);
    Route::get('clientes/{cliente}/envases', [\App\Http\Controllers\Api\V1\EnvaseClienteController::class, 'porCliente']);
    Route::get('clientes/{cliente}/ventas', [\App\Http\Controllers\Api\V1\ClienteController::class, 'ventas']);
    Route::get('clientes/{cliente}/estado-cuenta', [\App\Http\Controllers\Api\V1\ClienteController::class, 'estadoCuenta']);

    // Rutas y Flota
    Route::get('vehiculos', [\App\Http\Controllers\Api\V1\VehiculoController::class, 'index']);
    Route::apiResource('rutas', \App\Http\Controllers\Api\V1\RutaController::class)->except(['index']);
    Route::get('rutas/{ruta}/clientes', [\App\Http\Controllers\Api\V1\RutaController::class, 'clientes']);
    Route::apiResource('vehiculos', \App\Http\Controllers\Api\V1\VehiculoController::class)->except(['index']);
    Route::apiResource('repartidores', \App\Http\Controllers\Api\V1\RepartidorController::class);

    // Compras
    Route::apiResource('ordenes-compra', \App\Http\Controllers\Api\V1\OrdenCompraController::class);
    Route::post('ordenes-compra/{orden}/aprobar', [\App\Http\Controllers\Api\V1\OrdenCompraController::class, 'aprobar'])
        ->middleware('role:ADMIN|GERENTE');
    Route::post('ordenes-compra/{orden}/recibir', [\App\Http\Controllers\Api\V1\RecepcionController::class, 'store']);
    Route::get('recepciones', [\App\Http\Controllers\Api\V1\RecepcionController::class, 'index']);
    Route::get('recepciones/{recepcion}', [\App\Http\Controllers\Api\V1\RecepcionController::class, 'show']);

    // Pedidos (preventa)
    Route::apiResource('pedidos', \App\Http\Controllers\Api\V1\PedidoController::class);
    Route::post('pedidos/{pedido}/confirmar', [\App\Http\Controllers\Api\V1\PedidoController::class, 'confirmar']);
    Route::post('pedidos/{pedido}/cancelar', [\App\Http\Controllers\Api\V1\PedidoController::class, 'cancelar']);
    Route::post('pedidos/{pedido}/convertir-venta', [\App\Http\Controllers\Api\V1\PedidoController::class, 'convertirVenta']);

    // Ventas
    Route::get('ventas', [\App\Http\Controllers\Api\V1\VentaController::class, 'index']);
    Route::post('ventas', [\App\Http\Controllers\Api\V1\VentaController::class, 'store']);
    Route::get('ventas/{venta}', [\App\Http\Controllers\Api\V1\VentaController::class, 'show']);
    Route::post('ventas/{venta}/cancelar', [\App\Http\Controllers\Api\V1\VentaController::class, 'cancelar'])
        ->middleware('role:ADMIN|GERENTE');

    // Cargas
    Route::apiResource('cargas', \App\Http\Controllers\Api\V1\CargaController::class);
    Route::post('cargas/{carga}/iniciar',   [\App\Http\Controllers\Api\V1\CargaController::class, 'iniciar']);
    Route::post('cargas/{carga}/cancelar',  [\App\Http\Controllers\Api\V1\CargaController::class, 'cancelar'])
        ->middleware('role:ADMIN|GERENTE|ALMACENISTA');
    Route::post('cargas/{carga}/liquidar',  [\App\Http\Controllers\Api\V1\LiquidacionController::class, 'store'])
        ->middleware('role:ADMIN|GERENTE|ALMACENISTA');
    Route::get('cargas/{carga}/liquidacion',[\App\Http\Controllers\Api\V1\LiquidacionController::class, 'show']);

    // Devoluciones
    Route::get('devoluciones',                       [\App\Http\Controllers\Api\V1\DevolucionController::class, 'index']);
    Route::post('devoluciones',                      [\App\Http\Controllers\Api\V1\DevolucionController::class, 'store']);
    Route::get('devoluciones/{devolucion}',          [\App\Http\Controllers\Api\V1\DevolucionController::class, 'show']);
    Route::middleware('role:ADMIN|GERENTE')->group(function () {
        Route::post('devoluciones/{devolucion}/aprobar', [\App\Http\Controllers\Api\V1\DevolucionController::class, 'aprobar']);
        Route::post('devoluciones/{devolucion}/rechazar',[\App\Http\Controllers\Api\V1\DevolucionController::class, 'rechazar']);
    });

    // Mermas
    Route::get('mermas',                  [\App\Http\Controllers\Api\V1\MermaController::class, 'index']);
    Route::post('mermas',                 [\App\Http\Controllers\Api\V1\MermaController::class, 'store']);
    Route::get('mermas/{merma}',          [\App\Http\Controllers\Api\V1\MermaController::class, 'show']);
    Route::middleware('role:ADMIN|GERENTE')->group(function () {
        Route::post('mermas/{merma}/aprobar',  [\App\Http\Controllers\Api\V1\MermaController::class, 'aprobar']);
        Route::post('mermas/{merma}/rechazar', [\App\Http\Controllers\Api\V1\MermaController::class, 'rechazar']);
    });

    // Ajustes de Inventario
    Route::get('ajustes',                  [\App\Http\Controllers\Api\V1\AjusteController::class, 'index']);
    Route::post('ajustes',                 [\App\Http\Controllers\Api\V1\AjusteController::class, 'store']);
    Route::get('ajustes/{ajuste}',         [\App\Http\Controllers\Api\V1\AjusteController::class, 'show']);
    Route::middleware('role:ADMIN|GERENTE')->group(function () {
        Route::post('ajustes/{ajuste}/aprobar',  [\App\Http\Controllers\Api\V1\AjusteController::class, 'aprobar']);
        Route::post('ajustes/{ajuste}/rechazar', [\App\Http\Controllers\Api\V1\AjusteController::class, 'rechazar']);
    });

    // Envases Retornables
    Route::prefix('envases')->group(function () {
        Route::get('/movimientos', [\App\Http\Controllers\Api\V1\MovimientoEnvaseController::class, 'index']);
        Route::post('/movimientos', [\App\Http\Controllers\Api\V1\MovimientoEnvaseController::class, 'store']);
        Route::get('/saldos', [\App\Http\Controllers\Api\V1\EnvaseClienteController::class, 'saldosPorCliente']);
    });

    // Reportes (ADMIN + GERENTE)
    Route::middleware('role:ADMIN|GERENTE')->prefix('reportes')->group(function () {
        Route::get('/dashboard', [\App\Http\Controllers\Api\V1\ReporteController::class, 'dashboard']);
        Route::get('/ventas', [\App\Http\Controllers\Api\V1\ReporteController::class, 'ventas']);
        Route::get('/inventario', [\App\Http\Controllers\Api\V1\ReporteController::class, 'inventario']);
        Route::get('/cargas', [\App\Http\Controllers\Api\V1\ReporteController::class, 'cargas']);
        Route::get('/mermas', [\App\Http\Controllers\Api\V1\ReporteController::class, 'mermas']);
        Route::get('/clientes-deuda', [\App\Http\Controllers\Api\V1\ReporteController::class, 'clientesDeuda']);
        Route::get('/envases', [\App\Http\Controllers\Api\V1\ReporteController::class, 'envases']);
        Route::post('/exportar/{tipo}', [\App\Http\Controllers\Api\V1\ReporteController::class, 'exportar']);
    });

    // Audit Log (solo ADMIN)
    Route::get('audit-log', [\App\Http\Controllers\Api\V1\AuditLogController::class, 'index'])
        ->middleware('role:ADMIN');
});
