<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Venta extends Model
{
    use LogsActivity;

    protected $fillable = [
        'folio', 'cliente_id', 'usuario_id', 'pedido_id', 'almacen_id',
        'lista_precio_id', 'estado', 'tipo_pago', 'fecha_venta', 'fecha_vencimiento',
        'subtotal', 'descuento', 'iva', 'total', 'pagado', 'notas',
    ];

    protected $casts = [
        'fecha_venta'       => 'date',
        'fecha_vencimiento' => 'date',
        'subtotal'          => 'decimal:2',
        'descuento'         => 'decimal:2',
        'iva'               => 'decimal:2',
        'total'             => 'decimal:2',
        'pagado'            => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['estado', 'total', 'folio', 'tipo_pago'])
            ->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    public function cliente():    BelongsTo { return $this->belongsTo(Cliente::class); }
    public function usuario():    BelongsTo { return $this->belongsTo(User::class, 'usuario_id'); }
    public function pedido():     BelongsTo { return $this->belongsTo(Pedido::class); }
    public function almacen():    BelongsTo { return $this->belongsTo(Almacen::class); }
    public function listaPrecio():BelongsTo { return $this->belongsTo(ListaPrecio::class); }
    public function detalles():   HasMany   { return $this->hasMany(DetalleVenta::class); }

    public function getSaldoAttribute(): float
    {
        return max(0, (float) $this->total - (float) $this->pagado);
    }
}
