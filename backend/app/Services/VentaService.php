<?php

namespace App\Services;

use App\Models\Cliente;
use App\Models\DetalleVenta;
use App\Models\Pedido;
use App\Models\Venta;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VentaService
{
    public function __construct(private InventarioService $inventario) {}

    /**
     * Registra una venta directa (o desde pedido) y descuenta stock.
     * Actualiza saldo_pendiente del cliente si es crédito.
     */
    public function crearVenta(array $data, array $detalles, ?Pedido $pedido = null): Venta
    {
        return DB::transaction(function () use ($data, $detalles, $pedido) {
            $subtotal = 0.0;
            foreach ($detalles as $d) {
                $subtotal += $d['cantidad'] * $d['precio_unitario'] * (1 - ($d['descuento_pct'] ?? 0) / 100);
            }

            $descuento = (float) ($data['descuento'] ?? 0);
            $iva       = ($subtotal - $descuento) * 0.16;
            $total     = $subtotal - $descuento + $iva;

            $venta = Venta::create([
                'folio'            => $this->generarFolio(),
                'cliente_id'       => $data['cliente_id'],
                'usuario_id'       => Auth::id(),
                'pedido_id'        => $pedido?->id,
                'almacen_id'       => $data['almacen_id'],
                'lista_precio_id'  => $data['lista_precio_id'] ?? null,
                'estado'           => 'PENDIENTE',
                'tipo_pago'        => $data['tipo_pago'] ?? 'CONTADO',
                'fecha_venta'      => $data['fecha_venta'],
                'fecha_vencimiento'=> $data['fecha_vencimiento'] ?? null,
                'subtotal'         => round($subtotal, 2),
                'descuento'        => round($descuento, 2),
                'iva'              => round($iva, 2),
                'total'            => round($total, 2),
                'pagado'           => $data['tipo_pago'] === 'CONTADO' ? round($total, 2) : 0,
                'notas'            => $data['notas'] ?? null,
            ]);

            foreach ($detalles as $d) {
                DetalleVenta::create([
                    'venta_id'        => $venta->id,
                    'producto_id'     => $d['producto_id'],
                    'cantidad'        => $d['cantidad'],
                    'precio_unitario' => $d['precio_unitario'],
                    'descuento_pct'   => $d['descuento_pct'] ?? 0,
                ]);

                // Descuento de stock — regla de oro
                $this->inventario->mutarStock(
                    productoId:     $d['producto_id'],
                    almacenId:      $data['almacen_id'],
                    tipoMovimiento: InventarioService::SALIDA_VENTA,
                    cantidad:       (float) $d['cantidad'],
                    origen:         $venta,
                    referencia:     $venta->folio,
                );
            }

            // Actualizar estado de pago y saldo del cliente
            if ($data['tipo_pago'] === 'CONTADO') {
                $venta->update(['estado' => 'COBRADA']);
            } else {
                // Crédito: sumar saldo pendiente al cliente
                Cliente::where('id', $data['cliente_id'])
                    ->increment('saldo_pendiente', $total);

                // Calcular vencimiento si no fue dado
                if (!$venta->fecha_vencimiento) {
                    $cliente = Cliente::find($data['cliente_id']);
                    if ($cliente?->credito_dias > 0) {
                        $venta->update([
                            'fecha_vencimiento' => now()->addDays($cliente->credito_dias)->toDateString(),
                        ]);
                    }
                }
            }

            // Marcar pedido como entregado si aplica
            if ($pedido) {
                $pedido->update(['estado' => 'ENTREGADO']);
            }

            return $venta->load(['cliente', 'almacen', 'detalles.producto']);
        });
    }

    public function cancelarVenta(Venta $venta, string $motivo = ''): Venta
    {
        return DB::transaction(function () use ($venta, $motivo) {
            if ($venta->estado === 'CANCELADA') {
                throw new \RuntimeException('La venta ya está cancelada.');
            }

            // Revertir stock
            foreach ($venta->detalles as $d) {
                $this->inventario->mutarStock(
                    productoId:     $d->producto_id,
                    almacenId:      $venta->almacen_id,
                    tipoMovimiento: InventarioService::ENTRADA_DEVOLUCION,
                    cantidad:       (float) $d->cantidad,
                    origen:         $venta,
                    referencia:     $venta->folio,
                    observaciones:  "Cancelación: {$motivo}",
                );
            }

            // Revertir saldo del cliente si era crédito
            if ($venta->tipo_pago !== 'CONTADO') {
                $saldoRevertir = (float) $venta->total - (float) $venta->pagado;
                if ($saldoRevertir > 0) {
                    Cliente::where('id', $venta->cliente_id)
                        ->decrement('saldo_pendiente', $saldoRevertir);
                }
            }

            $venta->update(['estado' => 'CANCELADA']);

            return $venta;
        });
    }

    private function generarFolio(): string
    {
        $ultimo = Venta::max('id') ?? 0;
        return 'VTA-' . str_pad($ultimo + 1, 7, '0', STR_PAD_LEFT);
    }
}
