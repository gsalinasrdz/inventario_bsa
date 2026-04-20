<?php

namespace App\Http\Requests\Recepcion;

use App\Http\Requests\BaseFormRequest;

class StoreRecepcionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('compras.recibir');
    }

    public function rules(): array
    {
        return [
            'proveedor_id'                        => ['required', 'exists:proveedores,id'],
            'almacen_id'                          => ['required', 'exists:almacenes,id'],
            'fecha_recepcion'                     => ['required', 'date'],
            'referencia_proveedor'                => ['nullable', 'string', 'max:60'],
            'notas'                               => ['nullable', 'string'],
            'detalles'                            => ['required', 'array', 'min:1'],
            'detalles.*.producto_id'              => ['required', 'exists:productos,id'],
            'detalles.*.cantidad'                 => ['required', 'numeric', 'min:0.001'],
            'detalles.*.precio_unitario'          => ['required', 'numeric', 'min:0'],
            'detalles.*.lote'                     => ['nullable', 'string', 'max:60'],
            'detalles.*.fecha_vencimiento'        => ['nullable', 'date'],
            'detalles.*.detalle_orden_id'         => ['nullable', 'exists:detalle_orden_compra,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'proveedor_id.required'                => 'Debe seleccionar el proveedor.',
            'almacen_id.required'                  => 'Debe seleccionar el almacén receptor.',
            'fecha_recepcion.required'             => 'La fecha de recepción es obligatoria.',
            'detalles.required'                    => 'Debe incluir al menos un producto recibido.',
            'detalles.*.producto_id.required'       => 'Cada partida debe tener un producto.',
            'detalles.*.cantidad.min'              => 'La cantidad recibida debe ser mayor a cero.',
            'detalles.*.precio_unitario.min'       => 'El precio no puede ser negativo.',
        ];
    }
}
