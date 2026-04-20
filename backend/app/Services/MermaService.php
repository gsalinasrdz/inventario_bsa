<?php

namespace App\Services;

use App\Models\DetalleMerma;
use App\Models\Merma;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class MermaService
{
    public function __construct(private InventarioService $inventario) {}

    public function crear(array $data, array $detalles): Merma
    {
        return DB::transaction(function () use ($data, $detalles) {
            $merma = Merma::create([
                'folio'       => $this->generarFolio(),
                'almacen_id'  => $data['almacen_id'],
                'usuario_id'  => Auth::id(),
                'fecha_merma' => $data['fecha_merma'],
                'tipo_merma'  => $data['tipo_merma'],
                'estado'      => 'PENDIENTE',
                'notas'       => $data['notas'] ?? null,
            ]);

            foreach ($detalles as $d) {
                DetalleMerma::create([
                    'merma_id'   => $merma->id,
                    'producto_id'=> $d['producto_id'],
                    'cantidad'   => $d['cantidad'],
                    'motivo'     => $d['motivo'] ?? null,
                ]);
            }

            return $merma->load(['almacen', 'usuario', 'detalles.producto']);
        });
    }

    public function aprobar(Merma $merma): Merma
    {
        if ($merma->estado !== 'PENDIENTE') {
            throw new \RuntimeException('Solo se pueden aprobar mermas PENDIENTES.');
        }

        return DB::transaction(function () use ($merma) {
            $merma->loadMissing('detalles');

            foreach ($merma->detalles as $d) {
                $this->inventario->mutarStock(
                    productoId:     $d->producto_id,
                    almacenId:      $merma->almacen_id,
                    tipoMovimiento: InventarioService::SALIDA_MERMA,
                    cantidad:       (float) $d->cantidad,
                    origen:         $merma,
                    referencia:     $merma->folio,
                    observaciones:  $merma->tipo_merma,
                );
            }

            $merma->update([
                'estado'           => 'APROBADA',
                'aprobado_por'     => Auth::id(),
                'fecha_aprobacion' => now(),
            ]);

            return $merma;
        });
    }

    public function rechazar(Merma $merma): Merma
    {
        if ($merma->estado !== 'PENDIENTE') {
            throw new \RuntimeException('Solo se pueden rechazar mermas PENDIENTES.');
        }

        $merma->update([
            'estado'           => 'RECHAZADA',
            'aprobado_por'     => Auth::id(),
            'fecha_aprobacion' => now(),
        ]);

        return $merma;
    }

    private function generarFolio(): string
    {
        $ultimo = Merma::max('id') ?? 0;
        return 'MRM-' . str_pad($ultimo + 1, 5, '0', STR_PAD_LEFT);
    }
}
