<?php

namespace App\Http\Resources\Producto;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'codigo_sku'     => $this->codigo_sku,
            'codigo_barras'  => $this->codigo_barras,
            'nombre'         => $this->nombre,
            'descripcion'    => $this->descripcion,
            'estado'         => $this->estado,
            'es_retornable'  => $this->es_retornable,
            'peso_kg'        => $this->peso_kg,
            'stock_minimo'   => $this->stock_minimo,
            'stock_maximo'   => $this->stock_maximo,
            'stock_total'    => $this->stock_total ?? null,
            'imagen_url'     => $this->imagen_principal
                ? asset('storage/' . $this->imagen_principal)
                : null,

            // Relaciones
            'categoria'    => $this->whenLoaded('categoria', fn() => [
                'id'     => $this->categoria->id,
                'nombre' => $this->categoria->nombre,
            ]),
            'marca'        => $this->whenLoaded('marca', fn() => [
                'id'     => $this->marca->id,
                'nombre' => $this->marca->nombre,
            ]),
            'presentacion' => $this->whenLoaded('presentacion', fn() => [
                'id'       => $this->presentacion->id,
                'nombre'   => $this->presentacion->nombre,
                'unidades' => $this->presentacion->unidades,
            ]),
            'proveedor'    => $this->whenLoaded('proveedor', fn() => [
                'id'          => $this->proveedor->id,
                'razon_social'=> $this->proveedor->razon_social,
            ]),
            'imagenes'     => $this->whenLoaded('imagenes', fn() =>
                $this->imagenes->map(fn($img) => [
                    'id'          => $img->id,
                    'url'         => asset('storage/' . $img->ruta),
                    'es_principal'=> $img->es_principal,
                ])
            ),
            'precios'      => $this->whenLoaded('precios', fn() =>
                $this->precios->mapWithKeys(fn($p) => [
                    $p->lista_precio_id => [
                        'lista'  => $p->listaPrecio?->nombre,
                        'precio' => (float) $p->precio,
                    ],
                ])
            ),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
