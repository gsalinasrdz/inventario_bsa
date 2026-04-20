<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Venta\StoreVentaRequest;
use App\Models\Pedido;
use App\Models\Venta;
use App\Services\VentaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class VentaController extends Controller
{
    public function __construct(private VentaService $ventaService) {}

    public function index(Request $request)
    {
        $query = Venta::with(['cliente', 'almacen', 'usuario'])
            ->withCount('detalles')
            ->latest('fecha_venta');

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }
        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('tipo_pago')) {
            $query->where('tipo_pago', $request->tipo_pago);
        }
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_venta', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_venta', '<=', $request->fecha_hasta);
        }
        // VENDEDOR solo ve sus propias ventas
        if (Auth::user()->hasRole('VENDEDOR')) {
            $query->where('usuario_id', Auth::id());
        }

        $ventas = $query->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $ventas->map(fn($v) => $this->formatVenta($v)),
            'meta' => [
                'total'     => $ventas->total(),
                'page'      => $ventas->currentPage(),
                'last_page' => $ventas->lastPage(),
                'from'      => $ventas->firstItem(),
                'to'        => $ventas->lastItem(),
            ],
        ]);
    }

    public function store(StoreVentaRequest $request)
    {
        $data = $request->validated();

        $venta = $this->ventaService->crearVenta($data, $data['detalles']);

        return response()->json([
            'data'    => $this->formatVenta($venta, true),
            'message' => "Venta {$venta->folio} registrada correctamente.",
        ], 201);
    }

    public function show(Venta $venta)
    {
        // Vendedor solo puede ver sus propias ventas
        if (Auth::user()->hasRole('VENDEDOR') && $venta->usuario_id !== Auth::id()) {
            abort(403);
        }

        $venta->load(['cliente', 'almacen', 'usuario', 'detalles.producto', 'pedido']);

        return response()->json(['data' => $this->formatVenta($venta, true)]);
    }

    public function cancelar(Request $request, Venta $venta)
    {
        $request->validate(['motivo' => 'nullable|string|max:255']);

        $venta->load('detalles');
        $venta = $this->ventaService->cancelarVenta($venta, $request->motivo ?? '');

        return response()->json([
            'data'    => $this->formatVenta($venta),
            'message' => 'Venta cancelada y stock revertido.',
        ]);
    }

    private function formatVenta(Venta $v, bool $detail = false): array
    {
        $data = [
            'id'               => $v->id,
            'folio'            => $v->folio,
            'estado'           => $v->estado,
            'tipo_pago'        => $v->tipo_pago,
            'cliente'          => $v->cliente ? ['id' => $v->cliente->id, 'nombre' => $v->cliente->nombre, 'codigo' => $v->cliente->codigo] : null,
            'almacen'          => $v->almacen?->nombre,
            'usuario'          => $v->usuario?->name,
            'fecha_venta'      => $v->fecha_venta?->format('Y-m-d'),
            'fecha_vencimiento'=> $v->fecha_vencimiento?->format('Y-m-d'),
            'subtotal'         => $v->subtotal,
            'descuento'        => $v->descuento,
            'iva'              => $v->iva,
            'total'            => $v->total,
            'pagado'           => $v->pagado,
            'saldo'            => $v->saldo,
            'notas'            => $v->notas,
            'detalles_count'   => $v->detalles_count ?? $v->detalles?->count(),
            'created_at'       => $v->created_at,
        ];

        if ($detail && $v->relationLoaded('detalles')) {
            $data['detalles'] = $v->detalles->map(fn($d) => [
                'id'              => $d->id,
                'producto'        => $d->producto ? ['id' => $d->producto->id, 'nombre' => $d->producto->nombre, 'sku' => $d->producto->codigo_sku] : null,
                'cantidad'        => $d->cantidad,
                'precio_unitario' => $d->precio_unitario,
                'descuento_pct'   => $d->descuento_pct,
                'subtotal'        => $d->subtotal,
            ]);
        }

        return $data;
    }
}
