<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Carga\StoreCargaRequest;
use App\Http\Requests\Carga\UpdateCargaRequest;
use App\Models\Carga;
use App\Services\CargaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CargaController extends Controller
{
    public function __construct(private CargaService $service) {}

    public function index(Request $request): JsonResponse
    {
        $query = Carga::with(['ruta', 'vehiculo', 'usuario', 'almacen'])
            ->withCount('detalles');

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('ruta_id')) {
            $query->where('ruta_id', $request->ruta_id);
        }
        if ($request->filled('fecha_desde')) {
            $query->whereDate('fecha_carga', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('fecha_carga', '<=', $request->fecha_hasta);
        }

        $cargas = $query->latest()->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $cargas->map(fn($c) => $this->formatCarga($c)),
            'meta' => [
                'total'     => $cargas->total(),
                'from'      => $cargas->firstItem(),
                'to'        => $cargas->lastItem(),
                'last_page' => $cargas->lastPage(),
            ],
        ]);
    }

    public function store(StoreCargaRequest $request): JsonResponse
    {
        $data = $request->validated();

        $carga = $this->service->crearCarga($data, $data['detalles']);

        return response()->json(['data' => $this->formatCarga($carga, true), 'message' => 'Carga creada.'], 201);
    }

    public function show(Carga $carga): JsonResponse
    {
        $carga->load(['ruta', 'vehiculo', 'usuario', 'almacen', 'detalles.producto', 'liquidacion']);

        return response()->json(['data' => $this->formatCarga($carga, true)]);
    }

    public function update(UpdateCargaRequest $request, Carga $carga): JsonResponse
    {
        if ($carga->estado !== 'PREPARACION') {
            return response()->json(['message' => 'Solo se puede editar en PREPARACION.'], 422);
        }

        $data = $request->validated();

        $carga->update($data);

        return response()->json(['data' => $this->formatCarga($carga), 'message' => 'Carga actualizada.']);
    }

    public function destroy(Carga $carga): JsonResponse
    {
        if ($carga->estado !== 'PREPARACION') {
            return response()->json(['message' => 'Solo se pueden eliminar cargas en PREPARACION.'], 422);
        }

        $carga->delete();

        return response()->json(['message' => 'Carga eliminada.']);
    }

    public function iniciar(Carga $carga): JsonResponse
    {
        $carga = $this->service->iniciar($carga);

        return response()->json(['data' => $this->formatCarga($carga), 'message' => 'Carga iniciada. Stock descontado.']);
    }

    public function cancelar(Carga $carga): JsonResponse
    {
        $carga = $this->service->cancelar($carga);

        return response()->json(['data' => $this->formatCarga($carga), 'message' => 'Carga cancelada.']);
    }

    private function formatCarga(Carga $c, bool $withDetalles = false): array
    {
        $base = [
            'id'            => $c->id,
            'folio'         => $c->folio,
            'estado'        => $c->estado,
            'fecha_carga'   => $c->fecha_carga,
            'ruta'          => $c->ruta?->nombre,
            'vehiculo'      => $c->vehiculo ? "{$c->vehiculo->marca} {$c->vehiculo->modelo} ({$c->vehiculo->placa})" : null,
            'repartidor'    => $c->usuario?->name,
            'almacen'       => $c->almacen?->nombre,
            'notas'         => $c->notas,
            'detalles_count'=> $c->detalles_count ?? $c->detalles?->count(),
        ];

        if ($withDetalles && $c->relationLoaded('detalles')) {
            $base['detalles'] = $c->detalles->map(fn($d) => [
                'id'                => $d->id,
                'producto_id'       => $d->producto_id,
                'producto'          => $d->producto ? ['id' => $d->producto->id, 'nombre' => $d->producto->nombre, 'sku' => $d->producto->codigo_sku] : null,
                'cantidad_cargada'  => (float) $d->cantidad_cargada,
                'cantidad_vendida'  => (float) $d->cantidad_vendida,
                'cantidad_devuelta' => (float) $d->cantidad_devuelta,
                'pendiente'         => $d->pendiente,
                'precio_unitario'   => (float) $d->precio_unitario,
            ]);
        }

        if ($c->relationLoaded('liquidacion') && $c->liquidacion) {
            $liq = $c->liquidacion;
            $base['liquidacion'] = [
                'id'                => $liq->id,
                'folio'             => $liq->folio,
                'fecha_liquidacion' => $liq->fecha_liquidacion,
                'efectivo_esperado' => (float) $liq->efectivo_esperado,
                'efectivo_recibido' => (float) $liq->efectivo_recibido,
                'diferencia'        => $liq->diferencia,
                'notas'             => $liq->notas,
            ];
        }

        return $base;
    }
}
