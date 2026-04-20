<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Liquidacion\StoreLiquidacionRequest;
use App\Models\Carga;
use App\Services\CargaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LiquidacionController extends Controller
{
    public function __construct(private CargaService $service) {}

    public function store(StoreLiquidacionRequest $request, Carga $carga): JsonResponse
    {
        $liquidacion = $this->service->liquidar($carga, $request->validated());

        return response()->json([
            'data'    => $this->format($liquidacion),
            'message' => 'Liquidación registrada correctamente.',
        ], 201);
    }

    public function show(Carga $carga): JsonResponse
    {
        $liquidacion = $carga->liquidacion()->with('usuario')->first();

        if (!$liquidacion) {
            return response()->json(['message' => 'Esta carga aún no tiene liquidación.'], 404);
        }

        return response()->json(['data' => $this->format($liquidacion)]);
    }

    private function format($liq): array
    {
        return [
            'id'                => $liq->id,
            'folio'             => $liq->folio,
            'fecha_liquidacion' => $liq->fecha_liquidacion,
            'efectivo_esperado' => (float) $liq->efectivo_esperado,
            'efectivo_recibido' => (float) $liq->efectivo_recibido,
            'diferencia'        => $liq->diferencia,
            'notas'             => $liq->notas,
            'usuario'           => $liq->usuario?->name,
        ];
    }
}
