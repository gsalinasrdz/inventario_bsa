<?php

namespace App\Http\Requests\Vehiculo;

use App\Http\Requests\BaseFormRequest;

class StoreVehiculoRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('vehiculos.crear');
    }

    public function rules(): array
    {
        return [
            'placa'           => ['required', 'string', 'max:20', 'unique:vehiculos,placa'],
            'marca'           => ['required', 'string', 'max:60'],
            'modelo'          => ['required', 'string', 'max:60'],
            'anio'            => ['required', 'integer', 'min:1990', 'max:2030'],
            'capacidad_cajas' => ['required', 'integer', 'min:1'],
            'activo'          => ['boolean'],
            'notas'           => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'placa.required' => 'La placa del vehículo es obligatoria.',
            'placa.unique'   => 'Ya existe un vehículo con esa placa.',
            'marca.required' => 'La marca es obligatoria.',
            'anio.min'       => 'El año mínimo es 1990.',
            'anio.max'       => 'El año no puede ser mayor a 2030.',
        ];
    }
}
