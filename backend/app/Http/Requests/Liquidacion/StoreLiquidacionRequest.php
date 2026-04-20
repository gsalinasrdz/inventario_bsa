<?php

namespace App\Http\Requests\Liquidacion;

use App\Http\Requests\BaseFormRequest;

class StoreLiquidacionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('cargas.liquidar');
    }

    public function rules(): array
    {
        return [
            'efectivo_recibido'                => ['required', 'numeric', 'min:0'],
            'notas'                            => ['nullable', 'string', 'max:500'],
            'detalles'                         => ['required', 'array', 'min:1'],
            'detalles.*.producto_id'           => ['required', 'exists:productos,id'],
            'detalles.*.cantidad_devuelta'     => ['required', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'efectivo_recibido.required'         => 'El monto de efectivo recibido es obligatorio.',
            'detalles.required'                  => 'Debe registrar el detalle de devolución de productos.',
            'detalles.*.producto_id.required'    => 'Cada detalle debe tener un producto.',
            'detalles.*.cantidad_devuelta.min'   => 'La cantidad devuelta no puede ser negativa.',
        ];
    }
}
