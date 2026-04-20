<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoEnvase extends Model
{
    protected $table = 'movimientos_envase';

    protected $fillable = [
        'cliente_id',
        'tipo_envase_id',
        'usuario_id',
        'tipo',
        'cantidad',
        'referencia_tipo',
        'referencia_id',
        'notas',
    ];

    protected $casts = [
        'cantidad' => 'integer',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function tipoEnvase()
    {
        return $this->belongsTo(TipoEnvase::class);
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
