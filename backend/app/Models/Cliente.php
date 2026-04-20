<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Cliente extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'codigo',
        'nombre',
        'rfc',
        'telefono',
        'email',
        'direccion',
        'colonia',
        'municipio',
        'estado',
        'cp',
        'ruta_id',
        'zona_id',
        'lista_precio_id',
        'credito_limite',
        'credito_dias',
        'saldo_pendiente',
        'activo',
        'notas',
        'lat',
        'lng',
    ];

    protected $casts = [
        'credito_limite'  => 'decimal:2',
        'saldo_pendiente' => 'decimal:2',
        'activo'          => 'boolean',
        'lat'             => 'decimal:8',
        'lng'             => 'decimal:8',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nombre', 'rfc', 'activo', 'saldo_pendiente', 'credito_limite'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function ruta()
    {
        return $this->belongsTo(Ruta::class);
    }

    public function zona()
    {
        return $this->belongsTo(Zona::class);
    }

    public function listaPrecio()
    {
        return $this->belongsTo(ListaPrecio::class);
    }

    public function envases()
    {
        return $this->hasMany(EnvaseCliente::class);
    }

    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopeConDeuda($query)
    {
        return $query->where('saldo_pendiente', '>', 0);
    }
}
