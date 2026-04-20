<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehiculo\StoreVehiculoRequest;
use App\Http\Requests\Vehiculo\UpdateVehiculoRequest;
use App\Models\Vehiculo;
use Illuminate\Http\Request;

class VehiculoController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Vehiculo::orderBy('placa')->get(),
        ]);
    }

    public function store(StoreVehiculoRequest $request)
    {
        $validated = $request->validated();

        $vehiculo = Vehiculo::create($validated);

        return response()->json(['data' => $vehiculo, 'message' => 'Vehículo registrado.'], 201);
    }

    public function show(Vehiculo $vehiculo)
    {
        return response()->json(['data' => $vehiculo]);
    }

    public function update(UpdateVehiculoRequest $request, Vehiculo $vehiculo)
    {
        $validated = $request->validated();

        $vehiculo->update($validated);

        return response()->json(['data' => $vehiculo, 'message' => 'Vehículo actualizado.']);
    }

    public function destroy(Vehiculo $vehiculo)
    {
        if ($vehiculo->rutas()->exists()) {
            return response()->json(['message' => 'El vehículo tiene rutas asignadas.'], 422);
        }

        $vehiculo->delete();

        return response()->json(['message' => 'Vehículo eliminado.']);
    }
}
