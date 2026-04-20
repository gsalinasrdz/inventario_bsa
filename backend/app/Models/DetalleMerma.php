<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleMerma extends Model
{
    protected $table = 'detalle_merma';

    protected $fillable = ['merma_id', 'producto_id', 'cantidad', 'motivo'];

    public function merma()    { return $this->belongsTo(Merma::class); }
    public function producto() { return $this->belongsTo(Producto::class); }
}
