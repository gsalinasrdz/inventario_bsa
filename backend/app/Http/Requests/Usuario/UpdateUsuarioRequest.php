<?php

namespace App\Http\Requests\Usuario;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUsuarioRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('usuarios.editar');
    }

    public function rules(): array
    {
        $id = $this->route('usuario')?->id ?? $this->route('usuario');

        return [
            'nombre'   => ['sometimes', 'string', 'max:100'],
            'apellido' => ['sometimes', 'string', 'max:100'],
            'email'    => ['sometimes', 'email', 'max:150', Rule::unique('users', 'email')->ignore($id)],
            'password' => ['sometimes', 'nullable', Password::min(8)->letters()->numbers()],
            'rol'      => ['sometimes', 'string', 'exists:roles,name'],
            'activo'   => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Este correo ya está registrado en otro usuario.',
            'rol.exists'   => 'El rol seleccionado no existe.',
        ];
    }
}
