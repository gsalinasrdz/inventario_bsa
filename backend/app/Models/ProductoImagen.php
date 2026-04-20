<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoImagen extends Model
{
    protected $table    = 'producto_imagenes';
    protected $fillable = ['producto_id', 'ruta', 'es_principal', 'orden'];
    protected $casts    = ['es_principal' => 'boolean'];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->ruta);
    }
}
