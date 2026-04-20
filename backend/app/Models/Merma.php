<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Merma extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'folio', 'almacen_id', 'usuario_id', 'fecha_merma',
        'tipo_merma', 'estado', 'notas',
        'aprobado_por', 'fecha_aprobacion',
    ];

    protected $casts = ['fecha_aprobacion' => 'datetime'];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['estado'])->logOnlyDirty();
    }

    public function almacen()   { return $this->belongsTo(Almacen::class); }
    public function usuario()   { return $this->belongsTo(User::class, 'usuario_id'); }
    public function aprobador() { return $this->belongsTo(User::class, 'aprobado_por'); }
    public function detalles()  { return $this->hasMany(DetalleMerma::class); }
}
