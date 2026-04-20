<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ListaPrecio extends Model
{
    protected $table    = 'listas_precios';

    protected $fillable = ['nombre', 'descripcion', 'activo'];
    protected $casts    = ['activo' => 'boolean'];

    public function precios(): HasMany
    {
        return $this->hasMany(ProductoPrecio::class);
    }
}
