<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleCarga extends Model
{
    protected $table = 'detalle_carga';

    protected $fillable = [
        'carga_id', 'producto_id',
        'cantidad_cargada', 'cantidad_vendida', 'cantidad_devuelta',
        'precio_unitario',
    ];

    public function carga()   { return $this->belongsTo(Carga::class); }
    public function producto(){ return $this->belongsTo(Producto::class); }

    public function getPendienteAttribute(): float
    {
        return (float) $this->cantidad_cargada
             - (float) $this->cantidad_vendida
             - (float) $this->cantidad_devuelta;
    }
}
