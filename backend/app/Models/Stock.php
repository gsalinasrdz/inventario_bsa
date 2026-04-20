<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Stock extends Model
{
    protected $table = 'stock';

    protected $fillable = [
        'producto_id', 'almacen_id', 'cantidad', 'cantidad_reservada',
    ];

    protected $casts = [
        'cantidad'           => 'decimal:3',
        'cantidad_reservada' => 'decimal:3',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    public function getDisponibleAttribute(): float
    {
        return (float) $this->cantidad - (float) $this->cantidad_reservada;
    }
}
