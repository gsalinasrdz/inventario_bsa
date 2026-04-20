<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ruta extends Model
{
    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'zona_id',
        'vehiculo_id',
        'repartidor_id',
        'activo',
        'dia_visita',
    ];

    protected $casts = ['activo' => 'boolean'];

    public function zona()
    {
        return $this->belongsTo(Zona::class);
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function repartidor()
    {
        return $this->belongsTo(User::class, 'repartidor_id');
    }

    public function clientes()
    {
        return $this->hasMany(Cliente::class);
    }
}
