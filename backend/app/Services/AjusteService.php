<?php

namespace App\Services;

use App\Models\AjusteInventario;
use App\Models\DetalleAjuste;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AjusteService
{
    public function __construct(private InventarioService $inventario) {}

    public function crear(array $data, array $detalles): AjusteInventario
    {
        return DB::transaction(function () use ($data, $detalles) {
            $ajuste = AjusteInventario::create([
                'folio'       => $this->generarFolio(),
                'almacen_id'  => $data['almacen_id'],
                'usuario_id'  => Auth::id(),
                'fecha_ajuste'=> $data['fecha_ajuste'],
                'tipo'        => $data['tipo'],
                'estado'      => 'PENDIENTE',
                'motivo'      => $data['motivo'],
                'notas'       => $data['notas'] ?? null,
            ]);

            foreach ($detalles as $d) {
                DetalleAjuste::create([
                    'ajuste_id'  => $ajuste->id,
                    'producto_id'=> $d['producto_id'],
                    'cantidad'   => $d['cantidad'],
                ]);
            }

            return $ajuste->load(['almacen', 'usuario', 'detalles.producto']);
        });
    }

    public function aprobar(AjusteInventario $ajuste): AjusteInventario
    {
        if ($ajuste->estado !== 'PENDIENTE') {
            throw new \RuntimeException('Solo se pueden aprobar ajustes PENDIENTES.');
        }

        return DB::transaction(function () use ($ajuste) {
            $ajuste->loadMissing('detalles');

            $tipoMov = $ajuste->tipo === 'ENTRADA'
                ? InventarioService::ENTRADA_AJUSTE
                : InventarioService::SALIDA_AJUSTE;

            foreach ($ajuste->detalles as $d) {
                $this->inventario->mutarStock(
                    productoId:     $d->producto_id,
                    almacenId:      $ajuste->almacen_id,
                    tipoMovimiento: $tipoMov,
                    cantidad:       (float) $d->cantidad,
                    origen:         $ajuste,
                    referencia:     $ajuste->folio,
                    observaciones:  $ajuste->motivo,
                );
            }

            $ajuste->update([
                'estado'           => 'APROBADO',
                'aprobado_por'     => Auth::id(),
                'fecha_aprobacion' => now(),
            ]);

            return $ajuste;
        });
    }

    public function rechazar(AjusteInventario $ajuste): AjusteInventario
    {
        if ($ajuste->estado !== 'PENDIENTE') {
            throw new \RuntimeException('Solo se pueden rechazar ajustes PENDIENTES.');
        }

        $ajuste->update([
            'estado'           => 'RECHAZADO',
            'aprobado_por'     => Auth::id(),
            'fecha_aprobacion' => now(),
        ]);

        return $ajuste;
    }

    private function generarFolio(): string
    {
        $ultimo = AjusteInventario::max('id') ?? 0;
        return 'AJU-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
    }
}
