<?php

namespace App\Http\Controllers\Api\V1;

class PresentacionController extends CatalogoController
{
    protected function model(): string { return \App\Models\Presentacion::class; }

    protected function rules(int $id = 0): array
    {
        $unique = $id ? "unique:presentaciones,nombre,{$id}" : 'unique:presentaciones,nombre';

        return [
            'nombre'        => "required|string|max:100|{$unique}",
            'descripcion'   => 'nullable|string|max:255',
            'unidades'      => 'nullable|integer|min:1',
            'es_retornable' => 'boolean',
            'activo'        => 'boolean',
        ];
    }
}
