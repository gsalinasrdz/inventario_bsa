<?php

namespace App\Http\Requests\Merma;

use App\Http\Requests\BaseFormRequest;

class StoreMermaRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('mermas.crear');
    }

    public function rules(): array
    {
        return [
            'almacen_id'             => ['required', 'exists:almacenes,id'],
            'fecha_merma'            => ['required', 'date'],
            'tipo_merma'             => ['required', 'in:VENCIMIENTO,DAÑO,ROBO,OTRO'],
            'notas'                  => ['nullable', 'string', 'max:500'],
            'detalles'               => ['required', 'array', 'min:1'],
            'detalles.*.producto_id' => ['required', 'exists:productos,id'],
            'detalles.*.cantidad'    => ['required', 'numeric', 'min:0.001'],
            'detalles.*.motivo'      => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'almacen_id.required'             => 'Debe seleccionar el almacén.',
            'fecha_merma.required'            => 'La fecha de merma es obligatoria.',
            'tipo_merma.in'                   => 'El tipo de merma no es válido.',
            'detalles.required'               => 'Debe incluir al menos un producto.',
            'detalles.*.producto_id.required'  => 'Cada detalle debe tener un producto.',
            'detalles.*.cantidad.min'         => 'La cantidad debe ser mayor a cero.',
        ];
    }
}
