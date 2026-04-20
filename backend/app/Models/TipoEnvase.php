<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoEnvase extends Model
{
    protected $table = 'tipos_envase';

    protected $fillable = ['nombre', 'descripcion', 'activo'];

    protected $casts = ['activo' => 'boolean'];
}
