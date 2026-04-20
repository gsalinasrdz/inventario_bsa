<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Almacen extends Model
{
    protected $fillable = ['nombre', 'descripcion', 'activo'];
    protected $casts    = ['activo' => 'boolean'];

    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class);
    }
}
