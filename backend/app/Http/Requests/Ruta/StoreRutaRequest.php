<?php

namespace App\Http\Requests\Ruta;

use App\Http\Requests\BaseFormRequest;

class StoreRutaRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('rutas.crear');
    }

    public function rules(): array
    {
        return [
            'nombre'        => ['required', 'string', 'max:100', 'unique:rutas,nombre'],
            'codigo'        => ['nullable', 'string', 'max:20', 'unique:rutas,codigo'],
            'descripcion'   => ['nullable', 'string'],
            'zona_id'       => ['nullable', 'exists:zonas,id'],
            'vehiculo_id'   => ['nullable', 'exists:vehiculos,id'],
            'repartidor_id' => ['nullable', 'exists:users,id'],
            'dia_visita'    => ['nullable', 'string', 'max:50'],
            'activo'        => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la ruta es obligatorio.',
            'nombre.unique'   => 'Ya existe una ruta con ese nombre.',
            'codigo.unique'   => 'El código de ruta ya está en uso.',
        ];
    }
}
