<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AjusteInventario;
use App\Models\Carga;
use App\Models\Cliente;
use App\Models\Devolucion;
use App\Models\Merma;
use App\Models\Pedido;
use App\Models\Stock;
use App\Models\Venta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReporteController extends Controller
{
    /**
     * KPIs completos para el Dashboard principal.
     */
    public function dashboard(Request $request): JsonResponse
    {
        $hoy       = now()->toDateString();
        $inicioMes = now()->startOfMonth()->toDateString();
        $finMes    = now()->endOfMonth()->toDateString();

        // Ventas
        $ventasHoy = Venta::whereDate('fecha_venta', $hoy)
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->selectRaw('COUNT(*) as cantidad, SUM(total) as total')
            ->first();

        $ventasMes = Venta::whereBetween('fecha_venta', [$inicioMes, $finMes])
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->selectRaw('COUNT(*) as cantidad, SUM(total) as total, SUM(pagado) as cobrado')
            ->first();

        // Operaciones pendientes
        $cargasEnRuta          = Carga::where('estado', 'EN_RUTA')->count();
        $pedidosPendientes     = Pedido::whereIn('estado', ['PENDIENTE', 'CONFIRMADO'])->count();
        $mermasPendientes      = Merma::where('estado', 'PENDIENTE')->count();
        $ajustesPendientes     = AjusteInventario::where('estado', 'PENDIENTE')->count();
        $devolucionesPendientes= Devolucion::where('estado', 'PENDIENTE')->count();

        // Stock
        $stockBajo    = Stock::join('productos', 'stocks.producto_id', '=', 'productos.id')
            ->where('stocks.cantidad', '>', 0)
            ->whereRaw('stocks.cantidad <= productos.stock_minimo')
            ->distinct('stocks.producto_id')->count();

        $sinStock = Stock::where('cantidad', 0)->distinct('producto_id')->count();

        // Clientes con deuda
        $deudaTotal = Cliente::where('saldo_pendiente', '>', 0)
            ->selectRaw('COUNT(*) as cantidad, SUM(saldo_pendiente) as total')
            ->first();

        // Últimas ventas (5)
        $ultimasVentas = Venta::with('cliente:id,nombre')
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn($v) => [
                'id'         => $v->id,
                'folio'      => $v->folio,
                'cliente'    => $v->cliente?->nombre,
                'total'      => (float) $v->total,
                'estado'     => $v->estado,
                'fecha_venta'=> $v->fecha_venta,
            ]);

        // Stock crítico (agotado o bajo)
        $stockCritico = Stock::join('productos', 'stocks.producto_id', '=', 'productos.id')
            ->where(function ($q) {
                $q->where('stocks.cantidad', 0)
                  ->orWhereRaw('stocks.cantidad <= productos.stock_minimo');
            })
            ->select('productos.id', 'productos.nombre', 'productos.codigo_sku', 'stocks.cantidad', 'productos.stock_minimo')
            ->orderBy('stocks.cantidad')
            ->limit(8)
            ->get()
            ->map(fn($s) => [
                'id'           => $s->id,
                'nombre'       => $s->nombre,
                'sku'          => $s->codigo_sku,
                'cantidad'     => (float) $s->cantidad,
                'stock_minimo' => (float) $s->stock_minimo,
            ]);

        return response()->json([
            'ventas_hoy'              => ['cantidad' => (int) $ventasHoy->cantidad,   'total'   => (float) $ventasHoy->total],
            'ventas_mes'              => ['cantidad' => (int) $ventasMes->cantidad,   'total'   => (float) $ventasMes->total, 'cobrado' => (float) $ventasMes->cobrado],
            'cargas_en_ruta'          => $cargasEnRuta,
            'pedidos_pendientes'      => $pedidosPendientes,
            'mermas_pendientes'       => $mermasPendientes,
            'ajustes_pendientes'      => $ajustesPendientes,
            'devoluciones_pendientes' => $devolucionesPendientes,
            'stock_bajo'              => $stockBajo,
            'sin_stock'               => $sinStock,
            'clientes_con_deuda'      => ['cantidad' => (int) $deudaTotal->cantidad, 'total' => (float) $deudaTotal->total],
            'ultimas_ventas'          => $ultimasVentas,
            'stock_critico'           => $stockCritico,
        ]);
    }

    /**
     * Reporte de ventas con filtros de fecha y agrupación.
     */
    public function ventas(Request $request): JsonResponse
    {
        $desde    = $request->get('fecha_desde', now()->startOfMonth()->toDateString());
        $hasta    = $request->get('fecha_hasta', now()->toDateString());

        // Totales generales
        $totales = Venta::whereBetween('fecha_venta', [$desde, $hasta])
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->selectRaw('
                COUNT(*) as cantidad,
                SUM(subtotal)  as subtotal,
                SUM(descuento) as descuento,
                SUM(iva)       as iva,
                SUM(total)     as total,
                SUM(pagado)    as cobrado,
                SUM(total - pagado) as saldo_pendiente
            ')
            ->first();

        // Por tipo de pago
        $porTipoPago = Venta::whereBetween('fecha_venta', [$desde, $hasta])
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->select('tipo_pago', DB::raw('COUNT(*) as cantidad, SUM(total) as total'))
            ->groupBy('tipo_pago')
            ->get()
            ->map(fn($r) => ['tipo_pago' => $r->tipo_pago, 'cantidad' => (int) $r->cantidad, 'total' => (float) $r->total]);

        // Por día
        $porDia = Venta::whereBetween('fecha_venta', [$desde, $hasta])
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->select('fecha_venta', DB::raw('COUNT(*) as cantidad, SUM(total) as total'))
            ->groupBy('fecha_venta')
            ->orderBy('fecha_venta')
            ->get()
            ->map(fn($r) => ['fecha' => $r->fecha_venta, 'cantidad' => (int) $r->cantidad, 'total' => (float) $r->total]);

        // Top clientes
        $topClientes = Venta::with('cliente:id,nombre,codigo')
            ->whereBetween('fecha_venta', [$desde, $hasta])
            ->whereIn('estado', ['PENDIENTE', 'COBRADA'])
            ->select('cliente_id', DB::raw('COUNT(*) as cantidad, SUM(total) as total'))
            ->groupBy('cliente_id')
            ->orderByDesc('total')
            ->limit(10)
            ->get()
            ->map(fn($v) => ['cliente' => $v->cliente?->nombre, 'cantidad' => (int) $v->cantidad, 'total' => (float) $v->total]);

        return response()->json([
            'periodo'      => ['desde' => $desde, 'hasta' => $hasta],
            'totales'      => [
                'cantidad'         => (int) $totales->cantidad,
                'subtotal'         => (float) $totales->subtotal,
                'descuento'        => (float) $totales->descuento,
                'iva'              => (float) $totales->iva,
                'total'            => (float) $totales->total,
                'cobrado'          => (float) $totales->cobrado,
                'saldo_pendiente'  => (float) $totales->saldo_pendiente,
            ],
            'por_tipo_pago' => $porTipoPago,
            'por_dia'       => $porDia,
            'top_clientes'  => $topClientes,
        ]);
    }

    /**
     * Reporte de inventario: valorización y alertas.
     */
    public function inventario(Request $request): JsonResponse
    {
        $almacenId = $request->get('almacen_id');

        $query = Stock::join('productos', 'stocks.producto_id', '=', 'productos.id')
            ->join('almacenes', 'stocks.almacen_id', '=', 'almacenes.id');

        if ($almacenId) $query->where('stocks.almacen_id', $almacenId);

        // Resumen general
        $resumen = (clone $query)
            ->selectRaw('COUNT(DISTINCT stocks.producto_id) as productos, SUM(stocks.cantidad) as unidades_totales')
            ->first();

        // Sin stock
        $sinStock = (clone $query)
            ->where('stocks.cantidad', 0)
            ->select('productos.id', 'productos.nombre', 'productos.codigo_sku', 'almacenes.nombre as almacen')
            ->orderBy('productos.nombre')
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre, 'sku' => $s->codigo_sku, 'almacen' => $s->almacen]);

        // Stock bajo
        $stockBajo = (clone $query)
            ->where('stocks.cantidad', '>', 0)
            ->whereRaw('stocks.cantidad <= productos.stock_minimo')
            ->select('productos.id', 'productos.nombre', 'productos.codigo_sku', 'stocks.cantidad', 'productos.stock_minimo', 'almacenes.nombre as almacen')
            ->orderBy('stocks.cantidad')
            ->get()
            ->map(fn($s) => ['id' => $s->id, 'nombre' => $s->nombre, 'sku' => $s->codigo_sku, 'cantidad' => (float) $s->cantidad, 'stock_minimo' => (float) $s->stock_minimo, 'almacen' => $s->almacen]);

        return response()->json([
            'resumen'    => ['productos' => (int) $resumen->productos, 'unidades_totales' => (float) $resumen->unidades_totales],
            'sin_stock'  => $sinStock,
            'stock_bajo' => $stockBajo,
        ]);
    }

    /**
     * Reporte de mermas en un período.
     */
    public function mermas(Request $request): JsonResponse
    {
        $desde = $request->get('fecha_desde', now()->startOfMonth()->toDateString());
        $hasta = $request->get('fecha_hasta', now()->toDateString());

        $totales = Merma::whereBetween('fecha_merma', [$desde, $hasta])
            ->where('estado', 'APROBADA')
            ->select('tipo_merma', DB::raw('COUNT(*) as cantidad'))
            ->groupBy('tipo_merma')
            ->get()
            ->map(fn($r) => ['tipo' => $r->tipo_merma, 'cantidad' => (int) $r->cantidad]);

        $recientes = Merma::with(['almacen:id,nombre'])
            ->whereBetween('fecha_merma', [$desde, $hasta])
            ->where('estado', 'APROBADA')
            ->withCount('detalles')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn($m) => ['folio' => $m->folio, 'tipo' => $m->tipo_merma, 'almacen' => $m->almacen?->nombre, 'fecha' => $m->fecha_merma, 'items' => $m->detalles_count]);

        return response()->json([
            'periodo'  => ['desde' => $desde, 'hasta' => $hasta],
            'por_tipo' => $totales,
            'recientes'=> $recientes,
        ]);
    }

    /**
     * Clientes con deuda pendiente.
     */
    public function clientesDeuda(Request $request): JsonResponse
    {
        $clientes = Cliente::where('saldo_pendiente', '>', 0)
            ->with('ruta:id,nombre')
            ->select('id', 'nombre', 'codigo', 'saldo_pendiente', 'credito_limite', 'ruta_id')
            ->orderByDesc('saldo_pendiente')
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $clientes->map(fn($c) => [
                'id'               => $c->id,
                'nombre'           => $c->nombre,
                'codigo'           => $c->codigo,
                'saldo_pendiente'  => (float) $c->saldo_pendiente,
                'credito_limite'   => (float) $c->credito_limite,
                'uso_credito_pct'  => $c->credito_limite > 0 ? round($c->saldo_pendiente / $c->credito_limite * 100, 1) : null,
                'ruta'             => $c->ruta?->nombre,
            ]),
            'meta' => [
                'total'            => $clientes->total(),
                'total_deuda'      => Cliente::where('saldo_pendiente', '>', 0)->sum('saldo_pendiente'),
                'from'             => $clientes->firstItem(),
                'to'               => $clientes->lastItem(),
                'last_page'        => $clientes->lastPage(),
            ],
        ]);
    }

    /**
     * Reporte de cargas/liquidaciones.
     */
    public function cargas(Request $request): JsonResponse
    {
        $desde = $request->get('fecha_desde', now()->startOfMonth()->toDateString());
        $hasta = $request->get('fecha_hasta', now()->toDateString());

        $resumen = DB::table('cargas')
            ->whereBetween('fecha_carga', [$desde, $hasta])
            ->selectRaw('estado, COUNT(*) as cantidad')
            ->groupBy('estado')
            ->get()
            ->mapWithKeys(fn($r) => [$r->estado => (int) $r->cantidad]);

        $liquidaciones = DB::table('liquidaciones')
            ->join('cargas', 'liquidaciones.carga_id', '=', 'cargas.id')
            ->whereBetween('cargas.fecha_carga', [$desde, $hasta])
            ->selectRaw('
                COUNT(*) as cantidad,
                SUM(liquidaciones.efectivo_esperado) as esperado,
                SUM(liquidaciones.efectivo_recibido) as recibido
            ')
            ->first();

        return response()->json([
            'periodo'       => ['desde' => $desde, 'hasta' => $hasta],
            'por_estado'    => $resumen,
            'liquidaciones' => [
                'cantidad'  => (int) $liquidaciones->cantidad,
                'esperado'  => (float) $liquidaciones->esperado,
                'recibido'  => (float) $liquidaciones->recibido,
                'diferencia'=> (float) ($liquidaciones->recibido - $liquidaciones->esperado),
            ],
        ]);
    }

    public function envases(Request $request): JsonResponse
    {
        $saldos = DB::table('envases_cliente')
            ->join('clientes', 'envases_cliente.cliente_id', '=', 'clientes.id')
            ->join('tipos_envase', 'envases_cliente.tipo_envase_id', '=', 'tipos_envase.id')
            ->where('envases_cliente.cantidad_prestada', '>', 0)
            ->select('clientes.nombre', 'clientes.codigo', 'tipos_envase.nombre as tipo', 'envases_cliente.cantidad_prestada', 'envases_cliente.cantidad_devuelta')
            ->selectRaw('(envases_cliente.cantidad_prestada - envases_cliente.cantidad_devuelta) as saldo')
            ->having('saldo', '>', 0)
            ->orderByDesc('saldo')
            ->limit(50)
            ->get();

        return response()->json(['data' => $saldos]);
    }

    public function exportar(Request $request, string $tipo): JsonResponse
    {
        return response()->json(['message' => "Exportación de {$tipo} no implementada aún."], 501);
    }
}
