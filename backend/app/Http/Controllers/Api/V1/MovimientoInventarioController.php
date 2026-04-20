<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use Illuminate\Http\Request;

class MovimientoInventarioController extends Controller
{
    public function index(Request $request)
    {
        $query = MovimientoInventario::with(['producto', 'almacen', 'user'])
            ->latest('created_at');

        if ($request->filled('producto_id')) {
            $query->where('producto_id', $request->producto_id);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo_movimiento', $request->tipo);
        }

        if ($request->filled('almacen_id')) {
            $query->where('almacen_id', $request->almacen_id);
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        if ($request->filled('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }

        $movimientos = $query->paginate($request->integer('per_page', 30));

        return response()->json([
            'data' => $movimientos->map(fn($m) => $this->formatMovimiento($m)),
            'meta' => [
                'total'     => $movimientos->total(),
                'page'      => $movimientos->currentPage(),
                'last_page' => $movimientos->lastPage(),
                'from'      => $movimientos->firstItem(),
                'to'        => $movimientos->lastItem(),
            ],
        ]);
    }

    public function kardex(Request $request, int $productoId)
    {
        $movimientos = MovimientoInventario::with(['almacen', 'user'])
            ->where('producto_id', $productoId)
            ->when($request->filled('almacen_id'), fn($q) => $q->where('almacen_id', $request->almacen_id))
            ->when($request->filled('fecha_desde'), fn($q) => $q->whereDate('created_at', '>=', $request->fecha_desde))
            ->when($request->filled('fecha_hasta'), fn($q) => $q->whereDate('created_at', '<=', $request->fecha_hasta))
            ->orderBy('created_at')
            ->paginate($request->integer('per_page', 50));

        // Calcular saldo acumulado
        $saldoInicial = MovimientoInventario::where('producto_id', $productoId)
            ->when($request->filled('almacen_id'), fn($q) => $q->where('almacen_id', $request->almacen_id))
            ->when($request->filled('fecha_desde'), fn($q) => $q->whereDate('created_at', '<', $request->fecha_desde))
            ->sum('cantidad');

        $saldo = (int) $saldoInicial;
        $items = $movimientos->map(function ($m) use (&$saldo) {
            $saldo += $m->cantidad;
            return array_merge($this->formatMovimiento($m), ['saldo_acumulado' => $saldo]);
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'total'         => $movimientos->total(),
                'page'          => $movimientos->currentPage(),
                'last_page'     => $movimientos->lastPage(),
                'saldo_inicial' => (int) $saldoInicial,
            ],
        ]);
    }

    private function formatMovimiento(MovimientoInventario $m): array
    {
        return [
            'id'         => $m->id,
            'tipo'       => $m->tipo_movimiento,
            'cantidad'   => $m->cantidad,
            'costo_unit' => $m->costo_unitario,
            'referencia' => $m->referencia,
            'notas'      => $m->observaciones,
            'producto'   => [
                'id'     => $m->producto_id,
                'nombre' => $m->producto?->nombre,
                'sku'    => $m->producto?->codigo_sku,
            ],
            'almacen'    => $m->almacen?->nombre,
            'usuario'    => $m->user?->name,
            'created_at' => $m->created_at,
        ];
    }
}
