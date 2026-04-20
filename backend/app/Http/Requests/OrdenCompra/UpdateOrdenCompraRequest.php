<?php

namespace App\Http\Requests\OrdenCompra;

use App\Http\Requests\BaseFormRequest;

class UpdateOrdenCompraRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('compras.editar');
    }

    public function rules(): array
    {
        return [
            'fecha_esperada' => ['nullable', 'date', 'after_or_equal:today'],
            'notas'          => ['nullable', 'string'],
        ];
    }
}
