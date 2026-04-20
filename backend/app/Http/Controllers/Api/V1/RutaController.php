<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ruta\StoreRutaRequest;
use App\Http\Requests\Ruta\UpdateRutaRequest;
use App\Models\Ruta;
use Illuminate\Http\Request;

class RutaController extends Controller
{
    public function index(Request $request)
    {
        $rutas = Ruta::with(['zona', 'vehiculo', 'repartidor'])
            ->withCount('clientes')
            ->when($request->filled('zona_id'), fn($q) => $q->where('zona_id', $request->zona_id))
            ->when($request->has('activo'), fn($q) => $q->where('activo', $request->boolean('activo')))
            ->orderBy('nombre')
            ->get();

        return response()->json(['data' => $rutas]);
    }

    public function store(StoreRutaRequest $request)
    {
        $validated = $request->validated();

        $ruta = Ruta::create($validated);

        return response()->json([
            'data'    => $ruta->load(['zona', 'vehiculo', 'repartidor']),
            'message' => 'Ruta creada correctamente.',
        ], 201);
    }

    public function show(Ruta $ruta)
    {
        $ruta->load(['zona', 'vehiculo', 'repartidor', 'clientes']);

        return response()->json(['data' => $ruta]);
    }

    public function update(UpdateRutaRequest $request, Ruta $ruta)
    {
        $validated = $request->validated();

        $ruta->update($validated);

        return response()->json([
            'data'    => $ruta->load(['zona', 'vehiculo', 'repartidor']),
            'message' => 'Ruta actualizada correctamente.',
        ]);
    }

    public function destroy(Ruta $ruta)
    {
        if ($ruta->clientes()->count() > 0) {
            return response()->json([
                'message' => 'No se puede eliminar una ruta con clientes asignados.',
            ], 422);
        }

        $ruta->delete();

        return response()->json(['message' => 'Ruta eliminada correctamente.']);
    }

    public function clientes(Ruta $ruta)
    {
        $clientes = $ruta->clientes()->with('zona')->orderBy('nombre')->get();

        return response()->json(['data' => $clientes]);
    }
}
