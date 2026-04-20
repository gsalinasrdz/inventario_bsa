<?php

namespace App\Http\Requests\Producto;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateProductoRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('producto'));
    }

    public function rules(): array
    {
        $productoId = $this->route('producto')->id;

        return [
            'codigo_sku'       => ['sometimes', 'string', 'max:50', Rule::unique('productos', 'codigo_sku')->ignore($productoId)],
            'codigo_barras'    => ['nullable', 'string', 'max:50', Rule::unique('productos', 'codigo_barras')->ignore($productoId)],
            'nombre'           => ['sometimes', 'string', 'max:200'],
            'descripcion'      => ['nullable', 'string', 'max:1000'],
            'categoria_id'     => ['sometimes', 'exists:categorias,id'],
            'marca_id'         => ['sometimes', 'exists:marcas,id'],
            'presentacion_id'  => ['sometimes', 'exists:presentaciones,id'],
            'tipo_envase_id'   => ['nullable', 'exists:tipos_envase,id'],
            'proveedor_id'     => ['nullable', 'exists:proveedores,id'],
            'es_retornable'    => ['boolean'],
            'peso_kg'          => ['nullable', 'numeric', 'min:0'],
            'stock_minimo'     => ['sometimes', 'numeric', 'min:0'],
            'stock_maximo'     => ['nullable', 'numeric', 'min:0'],
            'estado'           => ['sometimes', 'in:ACTIVO,INACTIVO,DESCONTINUADO'],
            'precios'          => ['nullable', 'array'],
            'precios.*'        => ['numeric', 'min:0'],
        ];
    }
}
