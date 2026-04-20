<?php

namespace App\Http\Requests\Carga;

use App\Http\Requests\BaseFormRequest;

class UpdateCargaRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('cargas.crear');
    }

    public function rules(): array
    {
        return [
            'ruta_id'                        => ['nullable', 'exists:rutas,id'],
            'vehiculo_id'                    => ['nullable', 'exists:vehiculos,id'],
            'usuario_id'                     => ['required', 'exists:users,id'],
            'almacen_id'                     => ['required', 'exists:almacenes,id'],
            'fecha_carga'                    => ['required', 'date'],
            'notas'                          => ['nullable', 'string', 'max:500'],
            'detalles'                       => ['required', 'array', 'min:1'],
            'detalles.*.producto_id'         => ['required', 'exists:productos,id'],
            'detalles.*.cantidad'            => ['required', 'numeric', 'min:0.001'],
            'detalles.*.precio_unitario'     => ['required', 'numeric', 'min:0'],
        ];
    }
}
