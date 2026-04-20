<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleOrdenCompra extends Model
{
    protected $table = 'detalle_orden_compra';

    protected $fillable = [
        'orden_compra_id', 'producto_id',
        'cantidad_solicitada', 'cantidad_recibida',
        'precio_unitario', 'descuento_pct',
    ];

    protected $casts = [
        'cantidad_solicitada' => 'decimal:3',
        'cantidad_recibida'   => 'decimal:3',
        'precio_unitario'     => 'decimal:4',
        'descuento_pct'       => 'decimal:2',
    ];

    public function ordenCompra(): BelongsTo { return $this->belongsTo(OrdenCompra::class, 'orden_compra_id'); }
    public function producto():    BelongsTo { return $this->belongsTo(Producto::class); }

    public function getPendienteAttribute(): float
    {
        return max(0, (float) $this->cantidad_solicitada - (float) $this->cantidad_recibida);
    }
}
