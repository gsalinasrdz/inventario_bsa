<?php

namespace App\Services;

use App\Models\DetalleDevolucion;
use App\Models\Devolucion;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DevolucionService
{
    public function __construct(private InventarioService $inventario) {}

    public function crear(array $data, array $detalles): Devolucion
    {
        return DB::transaction(function () use ($data, $detalles) {
            $devolucion = Devolucion::create([
                'folio'            => $this->generarFolio(),
                'cliente_id'       => $data['cliente_id'] ?? null,
                'venta_id'         => $data['venta_id']   ?? null,
                'almacen_id'       => $data['almacen_id'],
                'usuario_id'       => Auth::id(),
                'fecha_devolucion' => $data['fecha_devolucion'],
                'estado'           => 'PENDIENTE',
                'motivo'           => $data['motivo'] ?? null,
                'notas'            => $data['notas']  ?? null,
            ]);

            foreach ($detalles as $d) {
                DetalleDevolucion::create([
                    'devolucion_id'  => $devolucion->id,
                    'producto_id'    => $d['producto_id'],
                    'cantidad'       => $d['cantidad'],
                    'precio_unitario'=> $d['precio_unitario'] ?? 0,
                ]);
            }

            return $devolucion->load(['cliente', 'almacen', 'usuario', 'detalles.producto']);
        });
    }

    public function aprobar(Devolucion $devolucion): Devolucion
    {
        if ($devolucion->estado !== 'PENDIENTE') {
            throw new \RuntimeException('Solo se pueden aprobar devoluciones PENDIENTES.');
        }

        return DB::transaction(function () use ($devolucion) {
            $devolucion->loadMissing('detalles');

            foreach ($devolucion->detalles as $d) {
                $this->inventario->mutarStock(
                    productoId:     $d->producto_id,
                    almacenId:      $devolucion->almacen_id,
                    tipoMovimiento: InventarioService::ENTRADA_DEVOLUCION,
                    cantidad:       (float) $d->cantidad,
                    origen:         $devolucion,
                    referencia:     $devolucion->folio,
                );
            }

            $devolucion->update([
                'estado'           => 'APROBADA',
                'aprobado_por'     => Auth::id(),
                'fecha_aprobacion' => now(),
            ]);

            return $devolucion;
        });
    }

    public function rechazar(Devolucion $devolucion): Devolucion
    {
        if ($devolucion->estado !== 'PENDIENTE') {
            throw new \RuntimeException('Solo se pueden rechazar devoluciones PENDIENTES.');
        }

        $devolucion->update([
            'estado'           => 'RECHAZADA',
            'aprobado_por'     => Auth::id(),
            'fecha_aprobacion' => now(),
        ]);

        return $devolucion;
    }

    private function generarFolio(): string
    {
        $ultimo = Devolucion::max('id') ?? 0;
        return 'DEV-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
    }
}
