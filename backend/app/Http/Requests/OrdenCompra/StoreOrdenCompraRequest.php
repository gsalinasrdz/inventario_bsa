<?php

namespace App\Http\Requests\OrdenCompra;

use App\Http\Requests\BaseFormRequest;

class StoreOrdenCompraRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('compras.crear');
    }

    public function rules(): array
    {
        return [
            'proveedor_id'                       => ['required', 'exists:proveedores,id'],
            'almacen_id'                         => ['required', 'exists:almacenes,id'],
            'fecha_esperada'                     => ['nullable', 'date', 'after_or_equal:today'],
            'descuento'                          => ['nullable', 'numeric', 'min:0'],
            'notas'                              => ['nullable', 'string'],
            'detalles'                           => ['required', 'array', 'min:1'],
            'detalles.*.producto_id'             => ['required', 'exists:productos,id'],
            'detalles.*.cantidad_solicitada'     => ['required', 'numeric', 'min:0.001'],
            'detalles.*.precio_unitario'         => ['required', 'numeric', 'min:0'],
            'detalles.*.descuento_pct'           => ['nullable', 'numeric', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'proveedor_id.required'                   => 'Debe seleccionar un proveedor.',
            'almacen_id.required'                     => 'Debe seleccionar el almacén de destino.',
            'fecha_esperada.after_or_equal'           => 'La fecha esperada no puede ser anterior a hoy.',
            'detalles.required'                       => 'Debe incluir al menos un producto.',
            'detalles.*.producto_id.required'          => 'Cada partida debe tener un producto.',
            'detalles.*.cantidad_solicitada.min'      => 'La cantidad debe ser mayor a cero.',
            'detalles.*.precio_unitario.min'          => 'El precio unitario no puede ser negativo.',
            'detalles.*.descuento_pct.max'            => 'El descuento no puede superar el 100%.',
        ];
    }
}
