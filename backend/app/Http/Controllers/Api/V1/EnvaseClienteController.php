<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Models\EnvaseCliente;
use Illuminate\Http\Request;

class EnvaseClienteController extends Controller
{
    public function porCliente(Cliente $cliente)
    {
        $envases = $cliente->envases()->with('tipoEnvase')->get()
            ->map(fn($e) => [
                'tipo'       => $e->tipoEnvase->nombre,
                'prestados'  => $e->cantidad_prestada,
                'devueltos'  => $e->cantidad_devuelta,
                'saldo'      => $e->saldo,
            ]);

        return response()->json(['data' => $envases]);
    }

    public function saldosPorCliente(Request $request)
    {
        $envases = EnvaseCliente::with(['cliente', 'tipoEnvase'])
            ->whereRaw('cantidad_prestada > cantidad_devuelta')
            ->when($request->filled('tipo_envase_id'), fn($q) => $q->where('tipo_envase_id', $request->tipo_envase_id))
            ->get()
            ->map(fn($e) => [
                'cliente_id'  => $e->cliente_id,
                'cliente'     => $e->cliente->nombre,
                'tipo_envase' => $e->tipoEnvase->nombre,
                'saldo'       => $e->saldo,
            ]);

        return response()->json(['data' => $envases]);
    }
}
