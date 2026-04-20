<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductoPrecio extends Model
{
    protected $table    = 'producto_precios';
    protected $fillable = ['producto_id', 'lista_precio_id', 'precio'];
    protected $casts    = ['precio' => 'decimal:4'];

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }

    public function listaPrecio(): BelongsTo
    {
        return $this->belongsTo(ListaPrecio::class);
    }
}
