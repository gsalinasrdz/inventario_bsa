<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pedido\ConvertirVentaRequest;
use App\Http\Requests\Pedido\StorePedidoRequest;
use App\Models\DetallePedido;
use App\Models\Pedido;
use App\Services\VentaService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    public function __construct(private VentaService $ventaService) {}

    public function index(Request $request)
    {
        $query = Pedido::with(['cliente', 'ruta', 'usuario'])
            ->withCount('detalles')
            ->latest();

        if ($request->filled('cliente_id'))  $query->where('cliente_id', $request->cliente_id);
        if ($request->filled('estado'))      $query->where('estado', $request->estado);
        if ($request->filled('ruta_id'))     $query->where('ruta_id', $request->ruta_id);
        if ($request->filled('fecha_desde')) $query->whereDate('fecha_entrega', '>=', $request->fecha_desde);
        if ($request->filled('fecha_hasta')) $query->whereDate('fecha_entrega', '<=', $request->fecha_hasta);

        if (Auth::user()->hasRole('VENDEDOR')) {
            $query->where('usuario_id', Auth::id());
        }

        $pedidos = $query->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $pedidos->map(fn($p) => $this->formatPedido($p)),
            'meta' => [
                'total'     => $pedidos->total(),
                'page'      => $pedidos->currentPage(),
                'last_page' => $pedidos->lastPage(),
                'from'      => $pedidos->firstItem(),
                'to'        => $pedidos->lastItem(),
            ],
        ]);
    }

    public function store(StorePedidoRequest $request)
    {
        $data = $request->validated();

        $pedido = DB::transaction(function () use ($data) {
            $subtotal = collect($data['detalles'])->sum(fn($d) =>
                $d['cantidad'] * $d['precio_unitario'] * (1 - ($d['descuento_pct'] ?? 0) / 100)
            );
            $descuento = (float) ($data['descuento'] ?? 0);

            $pedido = Pedido::create([
                'folio'           => $this->generarFolio(),
                'cliente_id'      => $data['cliente_id'],
                'usuario_id'      => Auth::id(),
                'ruta_id'         => $data['ruta_id'] ?? null,
                'lista_precio_id' => $data['lista_precio_id'] ?? null,
                'estado'          => 'PENDIENTE',
                'fecha_entrega'   => $data['fecha_entrega'] ?? null,
                'subtotal'        => round($subtotal, 2),
                'descuento'       => round($descuento, 2),
                'total'           => round($subtotal - $descuento, 2),
                'notas'           => $data['notas'] ?? null,
            ]);

            foreach ($data['detalles'] as $d) {
                DetallePedido::create([
                    'pedido_id'       => $pedido->id,
                    'producto_id'     => $d['producto_id'],
                    'cantidad'        => $d['cantidad'],
                    'precio_unitario' => $d['precio_unitario'],
                    'descuento_pct'   => $d['descuento_pct'] ?? 0,
                ]);
            }

            return $pedido->load(['cliente', 'detalles.producto']);
        });

        return response()->json([
            'data'    => $this->formatPedido($pedido, true),
            'message' => "Pedido {$pedido->folio} creado.",
        ], 201);
    }

    public function show(Pedido $pedido)
    {
        if (Auth::user()->hasRole('VENDEDOR') && $pedido->usuario_id !== Auth::id()) {
            abort(403);
        }

        $pedido->load(['cliente', 'ruta', 'usuario', 'detalles.producto', 'ventas']);

        return response()->json(['data' => $this->formatPedido($pedido, true)]);
    }

    public function confirmar(Pedido $pedido)
    {
        if ($pedido->estado !== 'PENDIENTE') {
            return response()->json(['message' => 'Solo se pueden confirmar pedidos pendientes.'], 422);
        }

        $pedido->update(['estado' => 'CONFIRMADO']);

        return response()->json(['data' => $this->formatPedido($pedido), 'message' => 'Pedido confirmado.']);
    }

    public function cancelar(Request $request, Pedido $pedido)
    {
        if (!in_array($pedido->estado, ['PENDIENTE', 'CONFIRMADO'])) {
            return response()->json(['message' => 'No se puede cancelar este pedido.'], 422);
        }

        $pedido->update(['estado' => 'CANCELADO']);

        return response()->json(['data' => $this->formatPedido($pedido), 'message' => 'Pedido cancelado.']);
    }

    public function convertirVenta(ConvertirVentaRequest $request, Pedido $pedido)
    {
        if (!in_array($pedido->estado, ['CONFIRMADO', 'PENDIENTE'])) {
            return response()->json(['message' => 'El pedido debe estar confirmado para convertirlo en venta.'], 422);
        }

        $data = $request->validated();

        $pedido->load('detalles.producto');

        $detalles = $pedido->detalles->map(fn($d) => [
            'producto_id'    => $d->producto_id,
            'cantidad'       => $d->cantidad,
            'precio_unitario'=> $d->precio_unitario,
            'descuento_pct'  => $d->descuento_pct,
        ])->toArray();

        $data['cliente_id'] = $pedido->cliente_id;

        $venta = $this->ventaService->crearVenta($data, $detalles, $pedido);

        return response()->json([
            'data'    => ['folio_venta' => $venta->folio, 'total' => $venta->total],
            'message' => "Venta {$venta->folio} generada desde pedido {$pedido->folio}.",
        ], 201);
    }

    private function generarFolio(): string
    {
        $ultimo = Pedido::max('id') ?? 0;
        return 'PED-' . str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
    }

    private function formatPedido(Pedido $p, bool $detail = false): array
    {
        $data = [
            'id'            => $p->id,
            'folio'         => $p->folio,
            'estado'        => $p->estado,
            'cliente'       => $p->cliente ? ['id' => $p->cliente->id, 'nombre' => $p->cliente->nombre, 'codigo' => $p->cliente->codigo] : null,
            'ruta'          => $p->ruta?->nombre,
            'usuario'       => $p->usuario?->name,
            'fecha_entrega' => $p->fecha_entrega?->format('Y-m-d'),
            'subtotal'      => $p->subtotal,
            'descuento'     => $p->descuento,
            'total'         => $p->total,
            'notas'         => $p->notas,
            'detalles_count'=> $p->detalles_count ?? $p->detalles?->count(),
            'created_at'    => $p->created_at,
        ];

        if ($detail && $p->relationLoaded('detalles')) {
            $data['detalles'] = $p->detalles->map(fn($d) => [
                'id'              => $d->id,
                'producto'        => $d->producto ? ['id' => $d->producto->id, 'nombre' => $d->producto->nombre, 'sku' => $d->producto->codigo_sku] : null,
                'cantidad'        => $d->cantidad,
                'precio_unitario' => $d->precio_unitario,
                'descuento_pct'   => $d->descuento_pct,
                'subtotal'        => $d->subtotal,
            ]);
        }

        if ($detail && $p->relationLoaded('ventas')) {
            $data['ventas'] = $p->ventas->map(fn($v) => ['id' => $v->id, 'folio' => $v->folio, 'total' => $v->total]);
        }

        return $data;
    }
}
