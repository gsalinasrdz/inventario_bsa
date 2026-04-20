<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Liquidacion extends Model
{
    use LogsActivity;

    protected $table = 'liquidaciones';

    protected $fillable = [
        'folio', 'carga_id', 'usuario_id', 'fecha_liquidacion',
        'efectivo_esperado', 'efectivo_recibido', 'notas',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['efectivo_recibido'])->logOnlyDirty();
    }

    public function getDiferenciaAttribute(): float
    {
        return (float) $this->efectivo_recibido - (float) $this->efectivo_esperado;
    }

    public function carga()   { return $this->belongsTo(Carga::class); }
    public function usuario() { return $this->belongsTo(User::class); }
}
