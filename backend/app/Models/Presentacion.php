<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Presentacion extends Model
{
    protected $fillable = ['nombre', 'unidades', 'es_retornable', 'activo'];
    protected $casts    = ['es_retornable' => 'boolean', 'activo' => 'boolean'];

    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class);
    }
}
