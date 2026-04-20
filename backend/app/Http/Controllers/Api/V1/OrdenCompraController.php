<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrdenCompra\StoreOrdenCompraRequest;
use App\Http\Requests\OrdenCompra\UpdateOrdenCompraRequest;
use App\Models\OrdenCompra;
use App\Services\CompraService;
use Illuminate\Http\Request;

class OrdenCompraController extends Controller
{
    public function __construct(private CompraService $compraService) {}

    public function index(Request $request)
    {
        $query = OrdenCompra::with(['proveedor', 'almacen', 'usuario'])
            ->withCount('detalles')
            ->latest();

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }
        if ($request->filled('proveedor_id')) {
            $query->where('proveedor_id', $request->proveedor_id);
        }
        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }

        $ordenes = $query->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => $ordenes->map(fn($o) => $this->formatOrden($o)),
            'meta' => [
                'total'     => $ordenes->total(),
                'page'      => $ordenes->currentPage(),
                'last_page' => $ordenes->lastPage(),
                'from'      => $ordenes->firstItem(),
                'to'        => $ordenes->lastItem(),
            ],
        ]);
    }

    public function store(StoreOrdenCompraRequest $request)
    {
        $data = $request->validated();

        $orden = $this->compraService->crearOrden($data, $data['detalles']);

        return response()->json([
            'data'    => $this->formatOrden($orden, true),
            'message' => 'Orden de compra creada.',
        ], 201);
    }

    public function show(OrdenCompra $ordenCompra)
    {
        $ordenCompra->load(['proveedor', 'almacen', 'usuario', 'detalles.producto', 'recepciones']);

        return response()->json(['data' => $this->formatOrden($ordenCompra, true)]);
    }

    public function update(UpdateOrdenCompraRequest $request, OrdenCompra $ordenCompra)
    {
        if (!in_array($ordenCompra->estado, ['BORRADOR'])) {
            return response()->json(['message' => 'Solo se pueden editar órdenes en estado BORRADOR.'], 422);
        }

        $data = $request->validated();

        $ordenCompra->update($data);

        return response()->json([
            'data'    => $this->formatOrden($ordenCompra->load(['proveedor', 'almacen'])),
            'message' => 'Orden actualizada.',
        ]);
    }

    public function destroy(OrdenCompra $ordenCompra)
    {
        if (!in_array($ordenCompra->estado, ['BORRADOR'])) {
            return response()->json(['message' => 'Solo se pueden eliminar órdenes en BORRADOR.'], 422);
        }

        $ordenCompra->delete();

        return response()->json(['message' => 'Orden eliminada.']);
    }

    public function aprobar(OrdenCompra $ordenCompra)
    {
        if ($ordenCompra->estado !== 'BORRADOR') {
            return response()->json(['message' => 'Solo se pueden enviar órdenes en BORRADOR.'], 422);
        }

        $ordenCompra->update(['estado' => 'ENVIADA']);

        return response()->json([
            'data'    => $this->formatOrden($ordenCompra),
            'message' => 'Orden enviada al proveedor.',
        ]);
    }

    private function formatOrden(OrdenCompra $o, bool $detail = false): array
    {
        $data = [
            'id'             => $o->id,
            'folio'          => $o->folio,
            'estado'         => $o->estado,
            'proveedor'      => $o->proveedor ? ['id' => $o->proveedor->id, 'nombre' => $o->proveedor->razon_social] : null,
            'almacen'        => $o->almacen?->nombre,
            'usuario'        => $o->usuario?->name,
            'fecha_esperada' => $o->fecha_esperada?->format('Y-m-d'),
            'subtotal'       => $o->subtotal,
            'descuento'      => $o->descuento,
            'iva'            => $o->iva,
            'total'          => $o->total,
            'notas'          => $o->notas,
            'detalles_count' => $o->detalles_count ?? $o->detalles?->count(),
            'created_at'     => $o->created_at,
        ];

        if ($detail && $o->relationLoaded('detalles')) {
            $data['detalles'] = $o->detalles->map(fn($d) => [
                'id'                  => $d->id,
                'producto_id'         => $d->producto_id,
                'producto'            => $d->producto ? [
                    'id'     => $d->producto->id,
                    'nombre' => $d->producto->nombre,
                    'sku'    => $d->producto->codigo_sku,
                ] : null,
                'cantidad_solicitada' => $d->cantidad_solicitada,
                'cantidad_recibida'   => $d->cantidad_recibida,
                'pendiente'           => $d->pendiente,
                'precio_unitario'     => $d->precio_unitario,
                'descuento_pct'       => $d->descuento_pct,
            ]);
        }

        if ($detail && $o->relationLoaded('recepciones')) {
            $data['recepciones'] = $o->recepciones->map(fn($r) => [
                'id'              => $r->id,
                'folio'           => $r->folio,
                'estado'          => $r->estado,
                'fecha_recepcion' => $r->fecha_recepcion?->format('Y-m-d'),
                'total'           => $r->total,
            ]);
        }

        return $data;
    }
}
