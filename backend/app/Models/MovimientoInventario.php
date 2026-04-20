<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class MovimientoInventario extends Model
{
    // Registro inmutable: nunca se actualiza ni elimina
    const UPDATED_AT = null;

    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'producto_id', 'almacen_id', 'tipo_movimiento',
        'cantidad', 'cantidad_anterior', 'cantidad_posterior',
        'costo_unitario', 'origen_type', 'origen_id',
        'user_id', 'referencia', 'observaciones',
    ];

    protected $casts = [
        'cantidad'           => 'decimal:3',
        'cantidad_anterior'  => 'decimal:3',
        'cantidad_posterior' => 'decimal:3',
        'costo_unitario'     => 'decimal:4',
    ];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function almacen(): BelongsTo
    {
        return $this->belongsTo(Almacen::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function origen(): MorphTo
    {
        return $this->morphTo();
    }
}
