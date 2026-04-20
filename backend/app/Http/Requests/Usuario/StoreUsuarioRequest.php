<?php

namespace App\Http\Requests\Usuario;

use App\Http\Requests\BaseFormRequest;
use Illuminate\Validation\Rules\Password;

class StoreUsuarioRequest extends BaseFormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('usuarios.crear');
    }

    public function rules(): array
    {
        return [
            'nombre'   => ['required', 'string', 'max:100'],
            'apellido' => ['required', 'string', 'max:100'],
            'email'    => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', Password::min(8)->letters()->numbers()],
            'rol'      => ['required', 'string', 'exists:roles,name'],
            'activo'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'    => 'El nombre es obligatorio.',
            'apellido.required'  => 'El apellido es obligatorio.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.unique'       => 'Este correo ya está registrado.',
            'password.required'  => 'La contraseña es obligatoria.',
            'rol.required'       => 'Debe asignar un rol al usuario.',
            'rol.exists'         => 'El rol seleccionado no existe.',
        ];
    }
}
