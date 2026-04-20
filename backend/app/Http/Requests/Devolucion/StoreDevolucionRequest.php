<?php

namespace App\Http\Requests\Devolucion;

use App\Http\Requests\BaseFormRequest;

class StoreDevolucionRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('devoluciones.crear');
    }

    public function rules(): array
    {
        return [
            'cliente_id'                     => ['nullable', 'exists:clientes,id'],
            'venta_id'                        => ['nullable', 'exists:ventas,id'],
            'almacen_id'                      => ['required', 'exists:almacenes,id'],
            'fecha_devolucion'                => ['required', 'date'],
            'motivo'                          => ['nullable', 'string', 'max:255'],
            'notas'                           => ['nullable', 'string', 'max:500'],
            'detalles'                        => ['required', 'array', 'min:1'],
            'detalles.*.producto_id'          => ['required', 'exists:productos,id'],
            'detalles.*.cantidad'             => ['required', 'numeric', 'min:0.001'],
            'detalles.*.precio_unitario'      => ['nullable', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'almacen_id.required'             => 'Debe seleccionar el almacén de destino.',
            'fecha_devolucion.required'        => 'La fecha de devolución es obligatoria.',
            'detalles.required'               => 'Debe incluir al menos un producto.',
            'detalles.*.producto_id.required'  => 'Cada detalle debe tener un producto.',
            'detalles.*.cantidad.min'         => 'La cantidad debe ser mayor a cero.',
        ];
    }
}
