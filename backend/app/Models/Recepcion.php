<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Recepcion extends Model
{
    use LogsActivity;

    protected $fillable = [
        'folio', 'orden_compra_id', 'proveedor_id', 'almacen_id', 'usuario_id',
        'estado', 'referencia_proveedor', 'fecha_recepcion', 'total', 'notas',
    ];

    protected $casts = [
        'fecha_recepcion' => 'date',
        'total'           => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['estado', 'total', 'folio'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function ordenCompra(): BelongsTo  { return $this->belongsTo(OrdenCompra::class, 'orden_compra_id'); }
    public function proveedor():   BelongsTo  { return $this->belongsTo(Proveedor::class); }
    public function almacen():     BelongsTo  { return $this->belongsTo(Almacen::class); }
    public function usuario():     BelongsTo  { return $this->belongsTo(User::class, 'usuario_id'); }
    public function detalles():    HasMany    { return $this->hasMany(DetalleRecepcion::class, 'recepcion_id'); }
}
