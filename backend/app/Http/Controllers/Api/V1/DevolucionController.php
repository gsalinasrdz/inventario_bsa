<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Devolucion\StoreDevolucionRequest;
use App\Models\Devolucion;
use App\Services\DevolucionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DevolucionController extends Controller
{
    public function __construct(private DevolucionService $service) {}

    public function index(Request $request): JsonResponse
    {
        $query = Devolucion::with(['cliente', 'almacen', 'usuario'])
            ->withCount('detalles');

        if ($request->filled('estado'))     $query->where('estado', $request->estado);
        if ($request->filled('cliente_id')) $query->where('cliente_id', $request->cliente_id);
        if ($request->filled('fecha_desde'))$query->whereDate('fecha_devolucion', '>=', $request->fecha_desde);
        if ($request->filled('fecha_hasta'))$query->whereDate('fecha_devolucion', '<=', $request->fecha_hasta);

        $items = $query->latest()->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $items->map(fn($d) => $this->fmt($d)),
            'meta' => ['total' => $items->total(), 'from' => $items->firstItem(), 'to' => $items->lastItem(), 'last_page' => $items->lastPage()],
        ]);
    }

    public function store(StoreDevolucionRequest $request): JsonResponse
    {
        $data = $request->validated();

        $devolucion = $this->service->crear($data, $data['detalles']);

        return response()->json(['data' => $this->fmt($devolucion, true), 'message' => 'Devolución registrada.'], 201);
    }

    public function show(Devolucion $devolucion): JsonResponse
    {
        $devolucion->load(['cliente', 'venta', 'almacen', 'usuario', 'aprobador', 'detalles.producto']);

        return response()->json(['data' => $this->fmt($devolucion, true)]);
    }

    public function aprobar(Devolucion $devolucion): JsonResponse
    {
        $devolucion = $this->service->aprobar($devolucion);

        return response()->json(['data' => $this->fmt($devolucion), 'message' => 'Devolución aprobada. Stock actualizado.']);
    }

    public function rechazar(Devolucion $devolucion): JsonResponse
    {
        $devolucion = $this->service->rechazar($devolucion);

        return response()->json(['data' => $this->fmt($devolucion), 'message' => 'Devolución rechazada.']);
    }

    private function fmt(Devolucion $d, bool $full = false): array
    {
        $base = [
            'id'               => $d->id,
            'folio'            => $d->folio,
            'estado'           => $d->estado,
            'fecha_devolucion' => $d->fecha_devolucion,
            'cliente'          => $d->cliente?->nombre,
            'almacen'          => $d->almacen?->nombre,
            'motivo'           => $d->motivo,
            'notas'            => $d->notas,
            'detalles_count'   => $d->detalles_count ?? $d->detalles?->count(),
        ];

        if ($full && $d->relationLoaded('detalles')) {
            $base['detalles'] = $d->detalles->map(fn($det) => [
                'id'             => $det->id,
                'producto'       => $det->producto ? ['id' => $det->producto->id, 'nombre' => $det->producto->nombre, 'sku' => $det->producto->codigo_sku] : null,
                'cantidad'       => (float) $det->cantidad,
                'precio_unitario'=> (float) $det->precio_unitario,
                'subtotal'       => $det->subtotal,
            ]);
        }

        return $base;
    }
}
