<?php

namespace App\Http\Requests\Ajuste;

use App\Http\Requests\BaseFormRequest;

class StoreAjusteRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('ajustes.crear');
    }

    public function rules(): array
    {
        return [
            'almacen_id'             => ['required', 'exists:almacenes,id'],
            'fecha_ajuste'           => ['required', 'date'],
            'tipo'                   => ['required', 'in:ENTRADA,SALIDA'],
            'motivo'                 => ['required', 'string', 'max:255'],
            'notas'                  => ['nullable', 'string', 'max:500'],
            'detalles'               => ['required', 'array', 'min:1'],
            'detalles.*.producto_id' => ['required', 'exists:productos,id'],
            'detalles.*.cantidad'    => ['required', 'numeric', 'min:0.001'],
        ];
    }

    public function messages(): array
    {
        return [
            'detalles.required'              => 'Debe incluir al menos un producto.',
            'detalles.*.producto_id.required' => 'Cada detalle debe tener un producto.',
            'detalles.*.cantidad.min'        => 'La cantidad debe ser mayor a cero.',
        ];
    }
}
