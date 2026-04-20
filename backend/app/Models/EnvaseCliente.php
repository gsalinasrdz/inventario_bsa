<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EnvaseCliente extends Model
{
    protected $table = 'envases_cliente';

    protected $fillable = [
        'cliente_id',
        'tipo_envase_id',
        'cantidad_prestada',
        'cantidad_devuelta',
    ];

    protected $casts = [
        'cantidad_prestada'  => 'integer',
        'cantidad_devuelta'  => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function tipoEnvase()
    {
        return $this->belongsTo(TipoEnvase::class);
    }

    public function getSaldoAttribute(): int
    {
        return $this->cantidad_prestada - $this->cantidad_devuelta;
    }
}
