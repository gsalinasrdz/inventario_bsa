<?php

namespace App\Http\Requests\Cliente;

use App\Http\Requests\BaseFormRequest;

class StoreClienteRequest extends BaseFormRequest
{
    public function authorize(): bool { return $this->user()->can('clientes.crear'); }

    public function rules(): array
    {
        return [
            'codigo'          => 'required|string|max:30|unique:clientes,codigo',
            'nombre'          => 'required|string|max:150',
            'rfc'             => 'nullable|string|max:13|regex:/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/',
            'telefono'        => 'nullable|string|max:20',
            'email'           => 'nullable|email|max:120',
            'direccion'       => 'nullable|string|max:255',
            'colonia'         => 'nullable|string|max:100',
            'municipio'       => 'nullable|string|max:100',
            'estado'          => 'nullable|string|max:60',
            'cp'              => 'nullable|string|max:10',
            'ruta_id'         => 'nullable|exists:rutas,id',
            'zona_id'         => 'nullable|exists:zonas,id',
            'lista_precio_id' => 'nullable|exists:listas_precios,id',
            'credito_limite'  => 'nullable|numeric|min:0',
            'credito_dias'    => 'nullable|integer|min:0|max:90',
            'activo'          => 'boolean',
            'notas'           => 'nullable|string',
            'lat'             => 'nullable|numeric|between:-90,90',
            'lng'             => 'nullable|numeric|between:-180,180',
        ];
    }
}
