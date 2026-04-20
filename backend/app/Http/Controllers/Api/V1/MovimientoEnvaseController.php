<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\MovimientoEnvase\StoreMovimientoEnvaseRequest;
use App\Models\EnvaseCliente;
use App\Models\MovimientoEnvase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MovimientoEnvaseController extends Controller
{
    public function index(Request $request)
    {
        $query = MovimientoEnvase::with(['cliente', 'tipoEnvase', 'usuario'])
            ->latest();

        if ($request->filled('cliente_id')) {
            $query->where('cliente_id', $request->cliente_id);
        }

        if ($request->filled('tipo_envase_id')) {
            $query->where('tipo_envase_id', $request->tipo_envase_id);
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', strtoupper($request->tipo));
        }

        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }

        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
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

    public function store(StoreMovimientoEnvaseRequest $request)
    {
        $validated = $request->validated();

        $validated['usuario_id'] = auth()->id();

        DB::transaction(function () use ($validated, &$movimiento) {
            $movimiento = MovimientoEnvase::create($validated);

            // Actualizar saldo en envases_cliente
            $envase = EnvaseCliente::firstOrCreate(
                [
                    'cliente_id'     => $validated['cliente_id'],
                    'tipo_envase_id' => $validated['tipo_envase_id'],
                ],
                ['cantidad_prestada' => 0, 'cantidad_devuelta' => 0]
            );

            if ($validated['tipo'] === 'PRESTAMO') {
                $envase->increment('cantidad_prestada', $validated['cantidad']);
            } else {
                // Validar que no devuelva más de lo prestado
                $saldoActual = $envase->cantidad_prestada - $envase->cantidad_devuelta;
                if ($validated['cantidad'] > $saldoActual) {
                    throw new \Exception(
                        "La cantidad a devolver ({$validated['cantidad']}) supera el saldo pendiente ({$saldoActual})."
                    );
                }
                $envase->increment('cantidad_devuelta', $validated['cantidad']);
            }
        });

        return response()->json([
            'data'    => $this->formatMovimiento($movimiento->load(['cliente', 'tipoEnvase', 'usuario'])),
            'message' => 'Movimiento de envase registrado correctamente.',
        ], 201);
    }

    private function formatMovimiento(MovimientoEnvase $m): array
    {
        return [
            'id'              => $m->id,
            'tipo'            => $m->tipo,
            'cantidad'        => $m->cantidad,
            'cliente'         => $m->cliente ? [
                'id'     => $m->cliente->id,
                'nombre' => $m->cliente->nombre,
                'codigo' => $m->cliente->codigo,
            ] : null,
            'tipo_envase'     => $m->tipoEnvase?->nombre,
            'referencia_tipo' => $m->referencia_tipo,
            'referencia_id'   => $m->referencia_id,
            'notas'           => $m->notas,
            'usuario'         => $m->usuario
                ? "{$m->usuario->nombre} {$m->usuario->apellido}"
                : null,
            'created_at'      => $m->created_at,
        ];
    }
}
