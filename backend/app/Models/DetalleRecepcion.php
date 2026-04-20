<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DetalleRecepcion extends Model
{
    protected $table = 'detalle_recepcion';

    protected $fillable = [
        'recepcion_id', 'producto_id', 'detalle_orden_id',
        'cantidad', 'precio_unitario', 'lote', 'fecha_vencimiento',
    ];

    protected $casts = [
        'cantidad'         => 'decimal:3',
        'precio_unitario'  => 'decimal:4',
        'fecha_vencimiento'=> 'date',
    ];

    public function recepcion():    BelongsTo { return $this->belongsTo(Recepcion::class); }
    public function producto():     BelongsTo { return $this->belongsTo(Producto::class); }
    public function detalleOrden(): BelongsTo { return $this->belongsTo(DetalleOrdenCompra::class, 'detalle_orden_id'); }
}
