<?php

namespace App\Http\Requests\Ruta;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;

class UpdateRutaRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('rutas.editar');
    }

    public function rules(): array
    {
        $id = $this->route('ruta')?->id ?? $this->route('ruta');

        return [
            'nombre'        => ['required', 'string', 'max:100', Rule::unique('rutas', 'nombre')->ignore($id)],
            'codigo'        => ['nullable', 'string', 'max:20', Rule::unique('rutas', 'codigo')->ignore($id)],
            'descripcion'   => ['nullable', 'string'],
            'zona_id'       => ['nullable', 'exists:zonas,id'],
            'vehiculo_id'   => ['nullable', 'exists:vehiculos,id'],
            'repartidor_id' => ['nullable', 'exists:users,id'],
            'dia_visita'    => ['nullable', 'string', 'max:50'],
            'activo'        => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la ruta es obligatorio.',
            'nombre.unique'   => 'Ya existe otra ruta con ese nombre.',
        ];
    }
}
