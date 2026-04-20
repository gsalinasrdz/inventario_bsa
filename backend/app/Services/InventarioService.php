<?php

namespace App\Services;

use App\Exceptions\StockInsuficienteException;
use App\Models\MovimientoInventario;
use App\Models\Stock;
use Illuminate\Support\Facades\Auth;

class InventarioService
{
    /**
     * Registra una mutación de inventario de forma atómica.
     *
     * IMPORTANTE: Siempre debe llamarse dentro de un DB::transaction() externo.
     * Usa lockForUpdate() para prevenir race conditions en entornos concurrentes.
     *
     * @param  int    $productoId     ID del producto
     * @param  int    $almacenId      ID del almacén
     * @param  string $tipoMovimiento Constante de tipo (ej. 'SALIDA_VENTA')
     * @param  float  $cantidad       Siempre positivo; la dirección la define el tipo
     * @param  object $origen         Modelo origen (Venta, Carga, Recepcion, etc.)
     * @param  float|null $costoUnitario Costo unitario para valorización
     * @param  string|null $referencia  Referencia externa (folio)
     * @param  string|null $observaciones Notas adicionales
     */
    public function mutarStock(
        int     $productoId,
        int     $almacenId,
        string  $tipoMovimiento,
        float   $cantidad,
        object  $origen,
        ?float  $costoUnitario = null,
        ?string $referencia = null,
        ?string $observaciones = null
    ): MovimientoInventario {

        // Bloqueo pesimista: previene race conditions bajo carga concurrente
        $stock = Stock::where('producto_id', $productoId)
            ->where('almacen_id', $almacenId)
            ->lockForUpdate()
            ->firstOrCreate(
                ['producto_id' => $productoId, 'almacen_id' => $almacenId],
                ['cantidad' => 0.0, 'cantidad_reservada' => 0.0]
            );

        $cantidadAnterior = (float) $stock->cantidad;
        $esSalida = $this->esSalida($tipoMovimiento);

        if ($esSalida && $cantidadAnterior < $cantidad) {
            throw new StockInsuficienteException(
                "Stock insuficiente para el producto ID {$productoId}. " .
                "Disponible: {$cantidadAnterior}, Requerido: {$cantidad}."
            );
        }

        $cantidadPosterior = $esSalida
            ? $cantidadAnterior - $cantidad
            : $cantidadAnterior + $cantidad;

        $stock->update(['cantidad' => $cantidadPosterior]);

        return MovimientoInventario::create([
            'producto_id'        => $productoId,
            'almacen_id'         => $almacenId,
            'tipo_movimiento'    => $tipoMovimiento,
            'cantidad'           => $cantidad,
            'cantidad_anterior'  => $cantidadAnterior,
            'cantidad_posterior' => $cantidadPosterior,
            'costo_unitario'     => $costoUnitario,
            'origen_type'        => get_class($origen),
            'origen_id'          => $origen->id,
            'user_id'            => Auth::id(),
            'referencia'         => $referencia,
            'observaciones'      => $observaciones,
        ]);
    }

    private function esSalida(string $tipo): bool
    {
        return str_starts_with($tipo, 'SALIDA_');
    }

    // Tipos de movimiento disponibles
    public const ENTRADA_COMPRA          = 'ENTRADA_COMPRA';
    public const SALIDA_VENTA            = 'SALIDA_VENTA';
    public const SALIDA_CARGA            = 'SALIDA_CARGA';
    public const ENTRADA_DEVOLUCION      = 'ENTRADA_DEVOLUCION';
    public const ENTRADA_AJUSTE          = 'ENTRADA_AJUSTE';
    public const SALIDA_AJUSTE           = 'SALIDA_AJUSTE';
    public const SALIDA_MERMA            = 'SALIDA_MERMA';
    public const ENTRADA_SOBRANTE_CARGA  = 'ENTRADA_SOBRANTE_CARGA';
    public const TRASLADO_ENTRADA        = 'TRASLADO_ENTRADA';
    public const TRASLADO_SALIDA         = 'TRASLADO_SALIDA';
}
