<?php

namespace App\Http\Requests\Venta;

use App\Http\Requests\BaseFormRequest;

class StoreVentaRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('ventas.crear');
    }

    public function rules(): array
    {
        return [
            'cliente_id'                     => ['required', 'exists:clientes,id'],
            'almacen_id'                     => ['required', 'exists:almacenes,id'],
            'lista_precio_id'                => ['nullable', 'exists:listas_precios,id'],
            'tipo_pago'                      => ['required', 'in:CONTADO,CREDITO,TRANSFERENCIA,CHEQUE'],
            'fecha_venta'                    => ['required', 'date'],
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
            'almacen_id.required'             => 'Debe seleccionar el almacén de salida.',
            'tipo_pago.required'              => 'Debe indicar la forma de pago.',
            'tipo_pago.in'                    => 'La forma de pago no es válida.',
            'fecha_venta.required'            => 'La fecha de venta es obligatoria.',
            'detalles.required'               => 'Debe incluir al menos un producto.',
            'detalles.*.producto_id.required'  => 'Cada partida debe tener un producto.',
            'detalles.*.cantidad.min'         => 'La cantidad debe ser mayor a cero.',
            'detalles.*.precio_unitario.min'  => 'El precio no puede ser negativo.',
        ];
    }
}
