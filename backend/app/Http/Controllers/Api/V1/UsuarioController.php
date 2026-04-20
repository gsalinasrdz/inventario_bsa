<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Usuario\StoreUsuarioRequest;
use App\Http\Requests\Usuario\UpdateUsuarioRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('roles')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('apellido', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
            );
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        if ($request->filled('rol')) {
            $query->role($request->rol);
        }

        $usuarios = $query->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $usuarios->map(fn($u) => $this->formatUsuario($u)),
            'meta' => [
                'total'     => $usuarios->total(),
                'page'      => $usuarios->currentPage(),
                'last_page' => $usuarios->lastPage(),
            ],
        ]);
    }

    public function store(StoreUsuarioRequest $request)
    {
        $validated = $request->validated();

        $usuario = User::create([
            'nombre'   => $validated['nombre'],
            'apellido' => $validated['apellido'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'activo'   => $validated['activo'] ?? true,
        ]);

        $usuario->assignRole($validated['rol']);

        return response()->json([
            'data'    => $this->formatUsuario($usuario->load('roles')),
            'message' => 'Usuario creado correctamente.',
        ], 201);
    }

    public function show(User $usuario)
    {
        return response()->json([
            'data' => $this->formatUsuario($usuario->load('roles')),
        ]);
    }

    public function update(UpdateUsuarioRequest $request, User $usuario)
    {
        $validated = $request->validated();

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $rol = $validated['rol'] ?? null;
        unset($validated['rol']);

        $usuario->update($validated);

        if ($rol) {
            $usuario->syncRoles([$rol]);
        }

        return response()->json([
            'data'    => $this->formatUsuario($usuario->load('roles')),
            'message' => 'Usuario actualizado correctamente.',
        ]);
    }

    public function destroy(User $usuario)
    {
        if ($usuario->id === auth()->id()) {
            return response()->json([
                'message' => 'No puedes eliminar tu propio usuario.',
            ], 422);
        }

        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente.']);
    }

    public function toggleActivo(User $usuario)
    {
        if ($usuario->id === auth()->id()) {
            return response()->json([
                'message' => 'No puedes desactivar tu propio usuario.',
            ], 422);
        }

        $usuario->update(['activo' => !$usuario->activo]);

        $estado = $usuario->activo ? 'activado' : 'desactivado';

        return response()->json([
            'data'    => $this->formatUsuario($usuario->load('roles')),
            'message' => "Usuario {$estado} correctamente.",
        ]);
    }

    private function formatUsuario(User $u): array
    {
        return [
            'id'            => $u->id,
            'nombre'        => $u->nombre,
            'apellido'      => $u->apellido,
            'nombre_completo' => "{$u->nombre} {$u->apellido}",
            'email'         => $u->email,
            'activo'        => $u->activo,
            'rol'           => $u->roles->first()?->name,
            'ultimo_acceso' => $u->ultimo_acceso,
            'created_at'    => $u->created_at,
        ];
    }
}
