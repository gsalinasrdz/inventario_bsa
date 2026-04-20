<?php

namespace App\Http\Requests\Pedido;

use App\Http\Requests\BaseFormRequest;

class ConvertirVentaRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('ventas.crear');
    }

    public function rules(): array
    {
        return [
            'almacen_id' => ['required', 'exists:almacenes,id'],
            'tipo_pago'  => ['required', 'in:CONTADO,CREDITO,TRANSFERENCIA,CHEQUE'],
        ];
    }

    public function messages(): array
    {
        return [
            'almacen_id.required' => 'Debe seleccionar el almacén de salida.',
            'tipo_pago.required'  => 'Debe indicar la forma de pago.',
            'tipo_pago.in'        => 'La forma de pago no es válida.',
        ];
    }
}
