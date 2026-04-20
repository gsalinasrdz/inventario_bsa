<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Zona extends Model
{
    protected $fillable = ['nombre', 'descripcion', 'activo'];

    protected $casts = ['activo' => 'boolean'];

    public function rutas()
    {
        return $this->hasMany(Ruta::class);
    }

    public function clientes()
    {
        return $this->hasMany(Cliente::class);
    }
}
