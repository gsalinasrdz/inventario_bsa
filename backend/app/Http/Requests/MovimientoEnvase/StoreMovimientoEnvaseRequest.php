<?php

namespace App\Http\Requests\MovimientoEnvase;

use App\Http\Requests\BaseFormRequest;

class StoreMovimientoEnvaseRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('envases.gestionar');
    }

    public function rules(): array
    {
        return [
            'cliente_id'      => ['required', 'exists:clientes,id'],
            'tipo_envase_id'  => ['required', 'exists:tipos_envase,id'],
            'tipo'            => ['required', 'in:PRESTAMO,DEVOLUCION'],
            'cantidad'        => ['required', 'integer', 'min:1'],
            'referencia_tipo' => ['nullable', 'string', 'max:50'],
            'referencia_id'   => ['nullable', 'integer'],
            'notas'           => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.required'     => 'Debe seleccionar un cliente.',
            'tipo_envase_id.required' => 'Debe seleccionar el tipo de envase.',
            'tipo.required'           => 'Debe indicar si es préstamo o devolución.',
            'tipo.in'                 => 'El tipo debe ser PRESTAMO o DEVOLUCION.',
            'cantidad.min'            => 'La cantidad debe ser al menos 1.',
        ];
    }
}
