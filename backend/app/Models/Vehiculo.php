<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculo extends Model
{
    protected $fillable = [
        'placa',
        'marca',
        'modelo',
        'anio',
        'capacidad_cajas',
        'activo',
        'notas',
    ];

    protected $casts = [
        'activo'          => 'boolean',
        'capacidad_cajas' => 'integer',
        'anio'            => 'integer',
    ];

    public function rutas()
    {
        return $this->hasMany(Ruta::class);
    }
}
