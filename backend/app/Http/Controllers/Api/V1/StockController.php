<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Stock;
use App\Models\Almacen;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request)
    {
        $query = Producto::with(['categoria', 'marca', 'presentacion'])
            ->withSum('stocks as stock_total', 'cantidad')
            ->withSum('stocks as reservado_total', 'cantidad_reservada')
            ->whereNull('deleted_at');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('codigo_sku', 'like', "%{$s}%")
            );
        }

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->boolean('stock_bajo')) {
            $query->having('stock_total', '<=', \DB::raw('productos.stock_minimo'));
        }

        if ($request->filled('almacen_id')) {
            $almacenId = $request->almacen_id;
            $query->whereHas('stocks', fn($q) => $q->where('almacen_id', $almacenId));
        }

        $productos = $query->orderBy('nombre')->paginate($request->integer('per_page', 50));

        return response()->json([
            'data' => $productos->map(function ($p) {
                return [
                    'id'              => $p->id,
                    'codigo_sku'      => $p->codigo_sku,
                    'nombre'          => $p->nombre,
                    'categoria'       => $p->categoria?->nombre,
                    'marca'           => $p->marca?->nombre,
                    'presentacion'    => $p->presentacion?->nombre,
                    'stock_total'     => (int) ($p->stock_total ?? 0),
                    'reservado_total' => (int) ($p->reservado_total ?? 0),
                    'disponible'      => (int) ($p->stock_total ?? 0) - (int) ($p->reservado_total ?? 0),
                    'stock_minimo'    => (float) $p->stock_minimo,
                    'stock_maximo'    => $p->stock_maximo ? (float) $p->stock_maximo : null,
                    'estado_stock'    => $this->estadoStock($p),
                    'estado'          => $p->estado,
                ];
            }),
            'meta' => [
                'total'     => $productos->total(),
                'page'      => $productos->currentPage(),
                'last_page' => $productos->lastPage(),
                'per_page'  => $productos->perPage(),
            ],
        ]);
    }

    public function show(int $productoId)
    {
        $producto = Producto::with(['categoria', 'marca', 'presentacion', 'stocks.almacen'])
            ->withSum('stocks as stock_total', 'cantidad')
            ->withSum('stocks as reservado_total', 'cantidad_reservada')
            ->findOrFail($productoId);

        return response()->json([
            'data' => [
                'id'           => $producto->id,
                'codigo_sku'   => $producto->codigo_sku,
                'nombre'       => $producto->nombre,
                'stock_total'  => (int) ($producto->stock_total ?? 0),
                'reservado'    => (int) ($producto->reservado_total ?? 0),
                'disponible'   => (int) ($producto->stock_total ?? 0) - (int) ($producto->reservado_total ?? 0),
                'stock_minimo' => (float) $producto->stock_minimo,
                'stock_maximo' => $producto->stock_maximo ? (float) $producto->stock_maximo : null,
                'estado_stock' => $this->estadoStock($producto),
                'por_almacen'  => $producto->stocks->map(fn($s) => [
                    'almacen_id'   => $s->almacen_id,
                    'almacen'      => $s->almacen->nombre,
                    'cantidad'     => $s->cantidad,
                    'reservada'    => $s->cantidad_reservada,
                    'disponible'   => $s->disponible,
                ]),
            ],
        ]);
    }

    public function resumen()
    {
        $total    = Producto::whereNull('deleted_at')->count();
        $activos  = Producto::whereNull('deleted_at')->where('estado', 'ACTIVO')->count();
        $stockBajo = Producto::whereNull('deleted_at')
            ->withSum('stocks as stock_total', 'cantidad')
            ->having('stock_total', '<=', \DB::raw('productos.stock_minimo'))
            ->count();
        $sinStock = Producto::whereNull('deleted_at')
            ->withSum('stocks as stock_total', 'cantidad')
            ->having('stock_total', '<=', 0)
            ->count();

        return response()->json([
            'data' => compact('total', 'activos', 'stockBajo', 'sinStock'),
        ]);
    }

    private function estadoStock(Producto $p): string
    {
        $stock = (int) ($p->stock_total ?? 0);
        if ($stock <= 0) return 'AGOTADO';
        if ($stock <= $p->stock_minimo) return 'BAJO';
        if ($p->stock_maximo && $stock >= $p->stock_maximo) return 'EXCESO';
        return 'NORMAL';
    }
}
