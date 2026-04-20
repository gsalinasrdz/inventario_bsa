<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Carga extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'folio', 'ruta_id', 'vehiculo_id', 'usuario_id', 'almacen_id',
        'fecha_carga', 'estado', 'notas',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['estado', 'notas'])->logOnlyDirty();
    }

    public function ruta()       { return $this->belongsTo(Ruta::class); }
    public function vehiculo()   { return $this->belongsTo(Vehiculo::class); }
    public function usuario()    { return $this->belongsTo(User::class); }
    public function almacen()    { return $this->belongsTo(Almacen::class); }
    public function detalles()   { return $this->hasMany(DetalleCarga::class); }
    public function liquidacion(){ return $this->hasOne(Liquidacion::class); }
}
