<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleDevolucion extends Model
{
    protected $table = 'detalle_devolucion';

    protected $fillable = ['devolucion_id', 'producto_id', 'cantidad', 'precio_unitario'];

    public function devolucion() { return $this->belongsTo(Devolucion::class); }
    public function producto()   { return $this->belongsTo(Producto::class); }

    public function getSubtotalAttribute(): float
    {
        return (float) $this->cantidad * (float) $this->precio_unitario;
    }
}
