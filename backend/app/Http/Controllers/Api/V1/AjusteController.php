<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ajuste\StoreAjusteRequest;
use App\Models\AjusteInventario;
use App\Services\AjusteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AjusteController extends Controller
{
    public function __construct(private AjusteService $service) {}

    public function index(Request $request): JsonResponse
    {
        $query = AjusteInventario::with(['almacen', 'usuario'])->withCount('detalles');

        if ($request->filled('estado'))     $query->where('estado', $request->estado);
        if ($request->filled('tipo'))       $query->where('tipo', $request->tipo);
        if ($request->filled('almacen_id')) $query->where('almacen_id', $request->almacen_id);
        if ($request->filled('fecha_desde'))$query->whereDate('fecha_ajuste', '>=', $request->fecha_desde);
        if ($request->filled('fecha_hasta'))$query->whereDate('fecha_ajuste', '<=', $request->fecha_hasta);

        $items = $query->latest()->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $items->map(fn($a) => $this->fmt($a)),
            'meta' => ['total' => $items->total(), 'from' => $items->firstItem(), 'to' => $items->lastItem(), 'last_page' => $items->lastPage()],
        ]);
    }

    public function store(StoreAjusteRequest $request): JsonResponse
    {
        $data = $request->validated();

        $ajuste = $this->service->crear($data, $data['detalles']);

        return response()->json(['data' => $this->fmt($ajuste, true), 'message' => 'Ajuste registrado.'], 201);
    }

    public function show(AjusteInventario $ajuste): JsonResponse
    {
        $ajuste->load(['almacen', 'usuario', 'aprobador', 'detalles.producto']);

        return response()->json(['data' => $this->fmt($ajuste, true)]);
    }

    public function aprobar(AjusteInventario $ajuste): JsonResponse
    {
        $ajuste = $this->service->aprobar($ajuste);

        return response()->json(['data' => $this->fmt($ajuste), 'message' => 'Ajuste aprobado. Stock actualizado.']);
    }

    public function rechazar(AjusteInventario $ajuste): JsonResponse
    {
        $ajuste = $this->service->rechazar($ajuste);

        return response()->json(['data' => $this->fmt($ajuste), 'message' => 'Ajuste rechazado.']);
    }

    private function fmt(AjusteInventario $a, bool $full = false): array
    {
        $base = [
            'id'           => $a->id,
            'folio'        => $a->folio,
            'estado'       => $a->estado,
            'fecha_ajuste' => $a->fecha_ajuste,
            'tipo'         => $a->tipo,
            'almacen'      => $a->almacen?->nombre,
            'motivo'       => $a->motivo,
            'notas'        => $a->notas,
            'detalles_count' => $a->detalles_count ?? $a->detalles?->count(),
        ];

        if ($full && $a->relationLoaded('detalles')) {
            $base['detalles'] = $a->detalles->map(fn($d) => [
                'id'       => $d->id,
                'producto' => $d->producto ? ['id' => $d->producto->id, 'nombre' => $d->producto->nombre, 'sku' => $d->producto->codigo_sku] : null,
                'cantidad' => (float) $d->cantidad,
            ]);
        }

        return $base;
    }
}
