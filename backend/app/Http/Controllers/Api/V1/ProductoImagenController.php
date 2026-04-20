<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\ProductoImagen;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ProductoImagenController extends Controller
{
    public function store(Request $request, Producto $producto): JsonResponse
    {
        $this->authorize('update', $producto);

        $request->validate([
            'imagen' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:5120'],
        ]);

        $maxW    = (int) config('app.image_max_width', 800);
        $maxH    = (int) config('app.image_max_height', 800);
        $quality = (int) config('app.image_quality', 85);

        $manager = new ImageManager(new Driver());
        $image   = $manager->read($request->file('imagen'));
        $image->scaleDown($maxW, $maxH);

        $filename = "productos/{$producto->id}/" . uniqid() . '.webp';
        Storage::disk('public')->put($filename, $image->toWebp($quality));

        $esPrincipal = $producto->imagenes()->count() === 0;

        $imagen = $producto->imagenes()->create([
            'ruta'         => $filename,
            'es_principal' => $esPrincipal,
            'orden'        => $producto->imagenes()->max('orden') + 1,
        ]);

        if ($esPrincipal) {
            $producto->update(['imagen_principal' => $filename]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $imagen->id,
                'url'         => asset('storage/' . $filename),
                'es_principal'=> $imagen->es_principal,
            ],
            'message' => 'Imagen subida correctamente.',
        ], 201);
    }

    public function destroy(Request $request, Producto $producto, ProductoImagen $imagen): JsonResponse
    {
        $this->authorize('update', $producto);

        Storage::disk('public')->delete($imagen->ruta);

        $eraPrincipal = $imagen->es_principal;
        $imagen->delete();

        // Si era principal, asignar la siguiente
        if ($eraPrincipal) {
            $siguiente = $producto->imagenes()->orderBy('orden')->first();
            if ($siguiente) {
                $siguiente->update(['es_principal' => true]);
                $producto->update(['imagen_principal' => $siguiente->ruta]);
            } else {
                $producto->update(['imagen_principal' => null]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Imagen eliminada correctamente.',
        ]);
    }
}
