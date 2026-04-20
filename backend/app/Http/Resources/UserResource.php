<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'nombre'       => $this->nombre,
            'apellido'     => $this->apellido,
            'nombre_completo' => "{$this->nombre} {$this->apellido}",
            'email'        => $this->email,
            'activo'       => $this->activo,
            'ultimo_acceso' => $this->ultimo_acceso?->toIso8601String(),
            'roles'        => $this->whenLoaded('roles', fn() =>
                $this->roles->pluck('name')
            ),
            'created_at'   => $this->created_at->toIso8601String(),
        ];
    }
}
