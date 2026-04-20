<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Merma\StoreMermaRequest;
use App\Models\Merma;
use App\Services\MermaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MermaController extends Controller
{
    public function __construct(private MermaService $service) {}

    public function index(Request $request): JsonResponse
    {
        $query = Merma::with(['almacen', 'usuario'])->withCount('detalles');

        if ($request->filled('estado'))     $query->where('estado', $request->estado);
        if ($request->filled('tipo_merma')) $query->where('tipo_merma', $request->tipo_merma);
        if ($request->filled('almacen_id')) $query->where('almacen_id', $request->almacen_id);
        if ($request->filled('fecha_desde'))$query->whereDate('fecha_merma', '>=', $request->fecha_desde);
        if ($request->filled('fecha_hasta'))$query->whereDate('fecha_merma', '<=', $request->fecha_hasta);

        $items = $query->latest()->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $items->map(fn($m) => $this->fmt($m)),
            'meta' => ['total' => $items->total(), 'from' => $items->firstItem(), 'to' => $items->lastItem(), 'last_page' => $items->lastPage()],
        ]);
    }

    public function store(StoreMermaRequest $request): JsonResponse
    {
        $data = $request->validated();

        $merma = $this->service->crear($data, $data['detalles']);

        return response()->json(['data' => $this->fmt($merma, true), 'message' => 'Merma registrada.'], 201);
    }

    public function show(Merma $merma): JsonResponse
    {
        $merma->load(['almacen', 'usuario', 'aprobador', 'detalles.producto']);

        return response()->json(['data' => $this->fmt($merma, true)]);
    }

    public function aprobar(Merma $merma): JsonResponse
    {
        $merma = $this->service->aprobar($merma);

        return response()->json(['data' => $this->fmt($merma), 'message' => 'Merma aprobada. Stock descontado.']);
    }

    public function rechazar(Merma $merma): JsonResponse
    {
        $merma = $this->service->rechazar($merma);

        return response()->json(['data' => $this->fmt($merma), 'message' => 'Merma rechazada.']);
    }

    private function fmt(Merma $m, bool $full = false): array
    {
        $base = [
            'id'          => $m->id,
            'folio'       => $m->folio,
            'estado'      => $m->estado,
            'fecha_merma' => $m->fecha_merma,
            'tipo_merma'  => $m->tipo_merma,
            'almacen'     => $m->almacen?->nombre,
            'notas'       => $m->notas,
            'detalles_count' => $m->detalles_count ?? $m->detalles?->count(),
        ];

        if ($full && $m->relationLoaded('detalles')) {
            $base['detalles'] = $m->detalles->map(fn($d) => [
                'id'       => $d->id,
                'producto' => $d->producto ? ['id' => $d->producto->id, 'nombre' => $d->producto->nombre, 'sku' => $d->producto->codigo_sku] : null,
                'cantidad' => (float) $d->cantidad,
                'motivo'   => $d->motivo,
            ]);
        }

        return $base;
    }
}
