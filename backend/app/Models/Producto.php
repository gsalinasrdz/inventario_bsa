<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Producto extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'codigo_sku', 'codigo_barras', 'nombre', 'descripcion',
        'categoria_id', 'marca_id', 'presentacion_id',
        'tipo_envase_id', 'proveedor_id',
        'es_retornable', 'peso_kg',
        'stock_minimo', 'stock_maximo',
        'imagen_principal', 'estado',
    ];

    protected $casts = [
        'es_retornable' => 'boolean',
        'stock_minimo'  => 'decimal:3',
        'stock_maximo'  => 'decimal:3',
        'peso_kg'       => 'decimal:3',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['nombre', 'estado', 'stock_minimo', 'codigo_sku'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('productos');
    }

    // ── Relaciones ─────────────────────────────────────────────────────
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class);
    }

    public function marca(): BelongsTo
    {
        return $this->belongsTo(Marca::class);
    }

    public function presentacion(): BelongsTo
    {
        return $this->belongsTo(Presentacion::class);
    }

    public function tipoEnvase(): BelongsTo
    {
        return $this->belongsTo(TipoEnvase::class);
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(Proveedor::class);
    }

    public function imagenes(): HasMany
    {
        return $this->hasMany(ProductoImagen::class)->orderBy('orden');
    }

    public function precios(): HasMany
    {
        return $this->hasMany(ProductoPrecio::class);
    }

    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class);
    }

    // ── Scopes ─────────────────────────────────────────────────────────
    public function scopeActivos($query)
    {
        return $query->where('estado', 'ACTIVO');
    }

    public function scopeConStockBajo($query, int $almacenId = null)
    {
        return $query->whereHas('stock', function ($q) use ($almacenId) {
            $q->whereColumn('cantidad', '<=', 'productos.stock_minimo');
            if ($almacenId) {
                $q->where('almacen_id', $almacenId);
            }
        });
    }
}
