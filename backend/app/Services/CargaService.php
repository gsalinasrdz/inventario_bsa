<?php

namespace App\Services;

use App\Models\Carga;
use App\Models\DetalleCarga;
use App\Models\Liquidacion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CargaService
{
    public function __construct(private InventarioService $inventario) {}

    public function crearCarga(array $data, array $detalles): Carga
    {
        return DB::transaction(function () use ($data, $detalles) {
            $carga = Carga::create([
                'folio'       => $this->generarFolio(),
                'ruta_id'     => $data['ruta_id'] ?? null,
                'vehiculo_id' => $data['vehiculo_id'] ?? null,
                'usuario_id'  => $data['usuario_id'],
                'almacen_id'  => $data['almacen_id'],
                'fecha_carga' => $data['fecha_carga'],
                'estado'      => 'PREPARACION',
                'notas'       => $data['notas'] ?? null,
            ]);

            foreach ($detalles as $d) {
                DetalleCarga::create([
                    'carga_id'        => $carga->id,
                    'producto_id'     => $d['producto_id'],
                    'cantidad_cargada'=> $d['cantidad'],
                    'precio_unitario' => $d['precio_unitario'],
                ]);
            }

            return $carga->load(['ruta', 'vehiculo', 'usuario', 'almacen', 'detalles.producto']);
        });
    }

    public function iniciar(Carga $carga): Carga
    {
        if ($carga->estado !== 'PREPARACION') {
            throw new \RuntimeException('Solo se puede iniciar una carga en PREPARACION.');
        }

        return DB::transaction(function () use ($carga) {
            $carga->loadMissing('detalles');

            foreach ($carga->detalles as $detalle) {
                $this->inventario->mutarStock(
                    productoId:     $detalle->producto_id,
                    almacenId:      $carga->almacen_id,
                    tipoMovimiento: InventarioService::SALIDA_CARGA,
                    cantidad:       (float) $detalle->cantidad_cargada,
                    origen:         $carga,
                    referencia:     $carga->folio,
                );
            }

            $carga->update(['estado' => 'EN_RUTA']);

            return $carga;
        });
    }

    public function cancelar(Carga $carga): Carga
    {
        if (in_array($carga->estado, ['LIQUIDADA', 'CANCELADA'])) {
            throw new \RuntimeException('No se puede cancelar una carga LIQUIDADA o ya CANCELADA.');
        }

        return DB::transaction(function () use ($carga) {
            // Si ya salió a ruta, revertir el stock descargado
            if ($carga->estado === 'EN_RUTA') {
                $carga->loadMissing('detalles');

                foreach ($carga->detalles as $detalle) {
                    $this->inventario->mutarStock(
                        productoId:     $detalle->producto_id,
                        almacenId:      $carga->almacen_id,
                        tipoMovimiento: InventarioService::ENTRADA_DEVOLUCION,
                        cantidad:       (float) $detalle->cantidad_cargada,
                        origen:         $carga,
                        referencia:     $carga->folio,
                        observaciones:  'Cancelación de carga',
                    );
                }
            }

            $carga->update(['estado' => 'CANCELADA']);

            return $carga;
        });
    }

    public function liquidar(Carga $carga, array $data): Liquidacion
    {
        if ($carga->estado !== 'EN_RUTA') {
            throw new \RuntimeException('Solo se puede liquidar una carga EN_RUTA.');
        }

        return DB::transaction(function () use ($carga, $data) {
            $carga->loadMissing('detalles');

            $efectivoEsperado = 0.0;

            foreach ($data['detalles'] as $d) {
                $detalle   = DetalleCarga::where('carga_id', $carga->id)
                                         ->where('producto_id', $d['producto_id'])
                                         ->firstOrFail();

                $devuelta = (float) ($d['cantidad_devuelta'] ?? 0);
                $vendida  = max(0, (float) $detalle->cantidad_cargada - $devuelta);

                $detalle->update([
                    'cantidad_vendida'  => $vendida,
                    'cantidad_devuelta' => $devuelta,
                ]);

                // Retornar mercancía no vendida al almacén
                if ($devuelta > 0) {
                    $this->inventario->mutarStock(
                        productoId:     $detalle->producto_id,
                        almacenId:      $carga->almacen_id,
                        tipoMovimiento: InventarioService::ENTRADA_DEVOLUCION,
                        cantidad:       $devuelta,
                        origen:         $carga,
                        referencia:     $carga->folio,
                        observaciones:  'Devolución en liquidación',
                    );
                }

                $efectivoEsperado += $vendida * (float) $detalle->precio_unitario;
            }

            $liquidacion = Liquidacion::create([
                'folio'              => $this->generarFolioLiquidacion(),
                'carga_id'           => $carga->id,
                'usuario_id'         => Auth::id(),
                'fecha_liquidacion'  => now()->toDateString(),
                'efectivo_esperado'  => round($efectivoEsperado, 2),
                'efectivo_recibido'  => round((float) ($data['efectivo_recibido'] ?? 0), 2),
                'notas'              => $data['notas'] ?? null,
            ]);

            $carga->update(['estado' => 'LIQUIDADA']);

            return $liquidacion->load(['carga', 'usuario']);
        });
    }

    private function generarFolio(): string
    {
        $ultimo = Carga::max('id') ?? 0;
        return 'CARGA-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
    }

    private function generarFolioLiquidacion(): string
    {
        $ultimo = Liquidacion::max('id') ?? 0;
        return 'LIQ-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
    }
}
