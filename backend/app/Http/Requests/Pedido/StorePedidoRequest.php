<?php

namespace App\Http\Requests\Pedido;

use App\Http\Requests\BaseFormRequest;

class StorePedidoRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('pedidos.crear');
    }

    public function rules(): array
    {
        return [
            'cliente_id'                     => ['required', 'exists:clientes,id'],
            'ruta_id'                        => ['nullable', 'exists:rutas,id'],
            'lista_precio_id'                => ['nullable', 'exists:listas_precios,id'],
            'fecha_entrega'                  => ['nullable', 'date'],
            'descuento'                      => ['nullable', 'numeric', 'min:0'],
            'notas'                          => ['nullable', 'string'],
            'detalles'                       => ['required', 'array', 'min:1'],
            'detalles.*.producto_id'         => ['required', 'exists:productos,id'],
            'detalles.*.cantidad'            => ['required', 'numeric', 'min:0.001'],
            'detalles.*.precio_unitario'     => ['required', 'numeric', 'min:0'],
            'detalles.*.descuento_pct'       => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'cliente_id.required'             => 'Debe seleccionar un cliente.',
            'detalles.required'               => 'Debe incluir al menos un producto.',
            'detalles.*.producto_id.required'  => 'Cada partida debe tener un producto.',
            'detalles.*.cantidad.min'         => 'La cantidad debe ser mayor a cero.',
            'detalles.*.precio_unitario.min'  => 'El precio no puede ser negativo.',
        ];
    }
}
