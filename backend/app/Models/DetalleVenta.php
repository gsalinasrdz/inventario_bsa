<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleVenta extends Model
{
    protected $table = 'detalle_venta';

    protected $fillable = [
        'venta_id', 'producto_id', 'cantidad', 'precio_unitario', 'descuento_pct',
    ];

    protected $casts = [
        'cantidad'        => 'decimal:3',
        'precio_unitario' => 'decimal:4',
        'descuento_pct'   => 'decimal:2',
    ];

    public function venta():    BelongsTo { return $this->belongsTo(Venta::class); }
    public function producto(): BelongsTo { return $this->belongsTo(Producto::class); }

    public function getSubtotalAttribute(): float
    {
        return round((float) $this->cantidad * (float) $this->precio_unitario * (1 - (float) $this->descuento_pct / 100), 2);
    }
}
