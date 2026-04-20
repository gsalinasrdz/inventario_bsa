<?php

namespace App\Services;

use App\Models\DetalleOrdenCompra;
use App\Models\DetalleRecepcion;
use App\Models\OrdenCompra;
use App\Models\Recepcion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CompraService
{
    public function __construct(private InventarioService $inventario) {}

    /**
     * Crea una Orden de Compra con sus detalles dentro de una transacción.
     */
    public function crearOrden(array $data, array $detalles): OrdenCompra
    {
        return DB::transaction(function () use ($data, $detalles) {
            $orden = OrdenCompra::create([
                'folio'          => $this->generarFolioOrden(),
                'proveedor_id'   => $data['proveedor_id'],
                'almacen_id'     => $data['almacen_id'],
                'usuario_id'     => Auth::id(),
                'estado'         => 'BORRADOR',
                'fecha_esperada' => $data['fecha_esperada'] ?? null,
                'notas'          => $data['notas'] ?? null,
            ]);

            $subtotal = 0.0;
            foreach ($detalles as $det) {
                $linea = $det['cantidad_solicitada'] * $det['precio_unitario']
                    * (1 - ($det['descuento_pct'] ?? 0) / 100);
                $subtotal += $linea;

                DetalleOrdenCompra::create([
                    'orden_compra_id'    => $orden->id,
                    'producto_id'        => $det['producto_id'],
                    'cantidad_solicitada'=> $det['cantidad_solicitada'],
                    'precio_unitario'    => $det['precio_unitario'],
                    'descuento_pct'      => $det['descuento_pct'] ?? 0,
                ]);
            }

            $iva   = $subtotal * 0.16;
            $total = $subtotal - ($data['descuento'] ?? 0) + $iva;

            $orden->update([
                'subtotal'  => round($subtotal, 2),
                'descuento' => round($data['descuento'] ?? 0, 2),
                'iva'       => round($iva, 2),
                'total'     => round($total, 2),
            ]);

            return $orden->load(['proveedor', 'almacen', 'detalles.producto']);
        });
    }

    /**
     * Registra la recepción de mercancía y actualiza el stock vía InventarioService.
     * Actualiza también las cantidades recibidas en los detalles de la OC.
     */
    public function procesarRecepcion(array $data, array $detalles, ?OrdenCompra $orden = null): Recepcion
    {
        return DB::transaction(function () use ($data, $detalles, $orden) {
            $recepcion = Recepcion::create([
                'folio'                  => $this->generarFolioRecepcion(),
                'orden_compra_id'        => $orden?->id,
                'proveedor_id'           => $data['proveedor_id'],
                'almacen_id'             => $data['almacen_id'],
                'usuario_id'             => Auth::id(),
                'estado'                 => 'PENDIENTE',
                'referencia_proveedor'   => $data['referencia_proveedor'] ?? null,
                'fecha_recepcion'        => $data['fecha_recepcion'],
                'notas'                  => $data['notas'] ?? null,
            ]);

            $total = 0.0;
            foreach ($detalles as $det) {
                $total += $det['cantidad'] * $det['precio_unitario'];

                $detRec = DetalleRecepcion::create([
                    'recepcion_id'    => $recepcion->id,
                    'producto_id'     => $det['producto_id'],
                    'detalle_orden_id'=> $det['detalle_orden_id'] ?? null,
                    'cantidad'        => $det['cantidad'],
                    'precio_unitario' => $det['precio_unitario'],
                    'lote'            => $det['lote'] ?? null,
                    'fecha_vencimiento'=> $det['fecha_vencimiento'] ?? null,
                ]);

                // Mutación de stock — regla de oro del sistema
                $this->inventario->mutarStock(
                    productoId:     $det['producto_id'],
                    almacenId:      $data['almacen_id'],
                    tipoMovimiento: InventarioService::ENTRADA_COMPRA,
                    cantidad:       (float) $det['cantidad'],
                    origen:         $recepcion,
                    costoUnitario:  (float) $det['precio_unitario'],
                    referencia:     $recepcion->folio,
                );

                // Actualizar cantidad recibida en detalle OC si aplica
                if (!empty($det['detalle_orden_id'])) {
                    DetalleOrdenCompra::where('id', $det['detalle_orden_id'])
                        ->increment('cantidad_recibida', $det['cantidad']);
                }
            }

            $recepcion->update([
                'estado' => 'PROCESADA',
                'total'  => round($total, 2),
            ]);

            // Actualizar estado de la OC si hay orden asociada
            if ($orden) {
                $this->actualizarEstadoOrden($orden);
            }

            return $recepcion->load(['proveedor', 'almacen', 'detalles.producto']);
        });
    }

    private function actualizarEstadoOrden(OrdenCompra $orden): void
    {
        $orden->load('detalles');
        $completa  = true;
        $alguna    = false;

        foreach ($orden->detalles as $det) {
            $recibida  = (float) $det->cantidad_recibida;
            $solicitada = (float) $det->cantidad_solicitada;
            if ($recibida > 0) $alguna = true;
            if ($recibida < $solicitada) $completa = false;
        }

        $nuevoEstado = match (true) {
            $completa         => 'COMPLETA',
            $alguna           => 'PARCIAL',
            default           => $orden->estado,
        };

        if ($nuevoEstado !== $orden->estado) {
            $orden->update(['estado' => $nuevoEstado]);
        }
    }

    private function generarFolioOrden(): string
    {
        $ultimo = OrdenCompra::max('id') ?? 0;
        return 'OC-' . str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
    }

    private function generarFolioRecepcion(): string
    {
        $ultimo = Recepcion::max('id') ?? 0;
        return 'REC-' . str_pad($ultimo + 1, 6, '0', STR_PAD_LEFT);
    }
}
