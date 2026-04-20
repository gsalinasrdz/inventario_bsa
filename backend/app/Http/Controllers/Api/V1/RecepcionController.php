<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Recepcion\StoreRecepcionRequest;
use App\Models\OrdenCompra;
use App\Models\Recepcion;
use App\Services\CompraService;
use Illuminate\Http\Request;

class RecepcionController extends Controller
{
    public function __construct(private CompraService $compraService) {}

    public function index(Request $request)
    {
        $recepciones = Recepcion::with(['proveedor', 'almacen', 'usuario', 'ordenCompra'])
            ->withCount('detalles')
            ->when($request->filled('proveedor_id'), fn($q) => $q->where('proveedor_id', $request->proveedor_id))
            ->when($request->filled('estado'), fn($q) => $q->where('estado', $request->estado))
            ->when($request->filled('fecha_desde'), fn($q) => $q->whereDate('fecha_recepcion', '>=', $request->fecha_desde))
            ->when($request->filled('fecha_hasta'), fn($q) => $q->whereDate('fecha_recepcion', '<=', $request->fecha_hasta))
            ->latest('fecha_recepcion')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $recepciones->map(fn($r) => $this->formatRecepcion($r)),
            'meta' => [
                'total'     => $recepciones->total(),
                'page'      => $recepciones->currentPage(),
                'last_page' => $recepciones->lastPage(),
                'from'      => $recepciones->firstItem(),
                'to'        => $recepciones->lastItem(),
            ],
        ]);
    }

    public function store(StoreRecepcionRequest $request, OrdenCompra $ordenCompra = null)
    {
        $data = $request->validated();

        // Si viene de una OC, verificar que está en estado válido
        if ($ordenCompra && !in_array($ordenCompra->estado, ['ENVIADA', 'PARCIAL'])) {
            return response()->json([
                'message' => 'La orden debe estar en estado ENVIADA o PARCIAL para recibir mercancía.',
            ], 422);
        }

        $recepcion = $this->compraService->procesarRecepcion($data, $data['detalles'], $ordenCompra);

        return response()->json([
            'data'    => $this->formatRecepcion($recepcion, true),
            'message' => "Recepción {$recepcion->folio} procesada. Stock actualizado.",
        ], 201);
    }

    public function show(Recepcion $recepcion)
    {
        $recepcion->load(['proveedor', 'almacen', 'usuario', 'ordenCompra', 'detalles.producto']);

        return response()->json(['data' => $this->formatRecepcion($recepcion, true)]);
    }

    private function formatRecepcion(Recepcion $r, bool $detail = false): array
    {
        $data = [
            'id'                   => $r->id,
            'folio'                => $r->folio,
            'estado'               => $r->estado,
            'proveedor'            => $r->proveedor ? ['id' => $r->proveedor->id, 'nombre' => $r->proveedor->razon_social] : null,
            'almacen'              => $r->almacen?->nombre,
            'usuario'              => $r->usuario?->name,
            'orden_compra'         => $r->ordenCompra ? ['id' => $r->ordenCompra->id, 'folio' => $r->ordenCompra->folio] : null,
            'referencia_proveedor' => $r->referencia_proveedor,
            'fecha_recepcion'      => $r->fecha_recepcion?->format('Y-m-d'),
            'total'                => $r->total,
            'notas'                => $r->notas,
            'detalles_count'       => $r->detalles_count ?? $r->detalles?->count(),
            'created_at'           => $r->created_at,
        ];

        if ($detail && $r->relationLoaded('detalles')) {
            $data['detalles'] = $r->detalles->map(fn($d) => [
                'id'              => $d->id,
                'producto'        => $d->producto ? [
                    'id'     => $d->producto->id,
                    'nombre' => $d->producto->nombre,
                    'sku'    => $d->producto->codigo_sku,
                ] : null,
                'cantidad'        => $d->cantidad,
                'precio_unitario' => $d->precio_unitario,
                'lote'            => $d->lote,
                'fecha_vencimiento'=> $d->fecha_vencimiento?->format('Y-m-d'),
                'subtotal'        => round((float)$d->cantidad * (float)$d->precio_unitario, 2),
            ]);
        }

        return $data;
    }
}
