<?php

namespace App\Http\Requests\Producto;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class StoreProductoRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', \App\Models\Producto::class);
    }

    public function rules(): array
    {
        return [
            'codigo_sku'       => ['required', 'string', 'max:50', 'unique:productos,codigo_sku'],
            'codigo_barras'    => ['nullable', 'string', 'max:50', 'unique:productos,codigo_barras'],
            'nombre'           => ['required', 'string', 'max:200'],
            'descripcion'      => ['nullable', 'string', 'max:1000'],
            'categoria_id'     => ['required', 'exists:categorias,id'],
            'marca_id'         => ['required', 'exists:marcas,id'],
            'presentacion_id'  => ['required', 'exists:presentaciones,id'],
            'tipo_envase_id'   => ['nullable', 'exists:tipos_envase,id'],
            'proveedor_id'     => ['nullable', 'exists:proveedores,id'],
            'es_retornable'    => ['boolean'],
            'peso_kg'          => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'stock_minimo'     => ['required', 'numeric', 'min:0'],
            'stock_maximo'     => ['nullable', 'numeric', 'min:0'],
            'estado'           => ['in:ACTIVO,INACTIVO,DESCONTINUADO'],
            'precios'          => ['nullable', 'array'],
            'precios.*'        => ['numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo_sku.required' => 'El código SKU es obligatorio.',
            'codigo_sku.unique'   => 'Este SKU ya está registrado.',
            'nombre.required'     => 'El nombre del producto es obligatorio.',
            'categoria_id.exists' => 'La categoría seleccionada no existe.',
            'marca_id.exists'     => 'La marca seleccionada no existe.',
            'presentacion_id.exists' => 'La presentación seleccionada no existe.',
        ];
    }
}
