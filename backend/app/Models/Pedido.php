<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Pedido extends Model
{
    use LogsActivity;

    protected $fillable = [
        'folio', 'cliente_id', 'usuario_id', 'ruta_id', 'lista_precio_id',
        'estado', 'fecha_entrega', 'subtotal', 'descuento', 'total', 'notas',
    ];

    protected $casts = [
        'fecha_entrega' => 'date',
        'subtotal'      => 'decimal:2',
        'descuento'     => 'decimal:2',
        'total'         => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['estado', 'total', 'folio'])
            ->logOnlyDirty()->dontSubmitEmptyLogs();
    }

    public function cliente():    BelongsTo { return $this->belongsTo(Cliente::class); }
    public function usuario():    BelongsTo { return $this->belongsTo(User::class, 'usuario_id'); }
    public function ruta():       BelongsTo { return $this->belongsTo(Ruta::class); }
    public function listaPrecio():BelongsTo { return $this->belongsTo(ListaPrecio::class); }
    public function detalles():   HasMany   { return $this->hasMany(DetallePedido::class); }
    public function ventas():     HasMany   { return $this->hasMany(Venta::class); }
}
