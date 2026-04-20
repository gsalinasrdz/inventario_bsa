<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class OrdenCompra extends Model
{
    use LogsActivity;

    protected $table = 'ordenes_compra';

    protected $fillable = [
        'folio', 'proveedor_id', 'almacen_id', 'usuario_id',
        'estado', 'fecha_esperada', 'subtotal', 'descuento', 'iva', 'total', 'notas',
    ];

    protected $casts = [
        'fecha_esperada' => 'date',
        'subtotal'       => 'decimal:2',
        'descuento'      => 'decimal:2',
        'iva'            => 'decimal:2',
        'total'          => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['estado', 'total', 'folio'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function proveedor(): BelongsTo { return $this->belongsTo(Proveedor::class); }
    public function almacen():  BelongsTo { return $this->belongsTo(Almacen::class); }
    public function usuario():  BelongsTo { return $this->belongsTo(User::class, 'usuario_id'); }
    public function detalles(): HasMany   { return $this->hasMany(DetalleOrdenCompra::class, 'orden_compra_id'); }
    public function recepciones(): HasMany { return $this->hasMany(Recepcion::class, 'orden_compra_id'); }

    public function scopePendientes($query)
    {
        return $query->whereIn('estado', ['BORRADOR', 'ENVIADA', 'PARCIAL']);
    }
}
