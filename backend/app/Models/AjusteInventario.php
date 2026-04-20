<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class AjusteInventario extends Model
{
    use SoftDeletes, LogsActivity;

    protected $table = 'ajustes_inventario';

    protected $fillable = [
        'folio', 'almacen_id', 'usuario_id', 'fecha_ajuste',
        'tipo', 'estado', 'motivo', 'notas',
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
    public function detalles()  { return $this->hasMany(DetalleAjuste::class, 'ajuste_id'); }
}
