<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleAjuste extends Model
{
    protected $table = 'detalle_ajuste';

    protected $fillable = ['ajuste_id', 'producto_id', 'cantidad'];

    public function ajuste()   { return $this->belongsTo(AjusteInventario::class, 'ajuste_id'); }
    public function producto() { return $this->belongsTo(Producto::class); }
}
