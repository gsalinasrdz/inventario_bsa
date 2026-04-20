<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoPrecioController extends Controller
{
    public function index(Producto $producto): JsonResponse
    {
        $precios = $producto->precios()->with('listaPrecio')->get();

        return response()->json([
            'success' => true,
            'data'    => $precios->mapWithKeys(fn($p) => [
                $p->lista_precio_id => [
                    'lista'  => $p->listaPrecio?->nombre,
                    'precio' => (float) $p->precio,
                ],
            ]),
        ]);
    }

    public function sync(Request $request, Producto $producto): JsonResponse
    {
        $this->authorize('update', $producto);

        $request->validate([
            'precios'   => ['required', 'array'],
            'precios.*' => ['numeric', 'min:0'],
        ]);

        foreach ($request->input('precios') as $listaPrecioId => $precio) {
            $producto->precios()->updateOrCreate(
                ['lista_precio_id' => $listaPrecioId],
                ['precio'          => $precio]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Precios actualizados correctamente.',
        ]);
    }
}
