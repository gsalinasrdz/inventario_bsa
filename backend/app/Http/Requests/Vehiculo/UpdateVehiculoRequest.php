<?php

namespace App\Http\Requests\Vehiculo;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateVehiculoRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('vehiculos.editar');
    }

    public function rules(): array
    {
        $id = $this->route('vehiculo')?->id ?? $this->route('vehiculo');

        return [
            'placa'           => ['required', 'string', 'max:20', Rule::unique('vehiculos', 'placa')->ignore($id)],
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
            'placa.unique' => 'Ya existe otro vehículo con esa placa.',
        ];
    }
}
