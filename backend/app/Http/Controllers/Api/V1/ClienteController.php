<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cliente\StoreClienteRequest;
use App\Http\Requests\Cliente\UpdateClienteRequest;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    public function index(Request $request)
    {
        $query = Cliente::with(['ruta', 'zona', 'listaPrecio'])
            ->withCount('envases');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(fn($q) =>
                $q->where('nombre', 'like', "%{$s}%")
                  ->orWhere('codigo', 'like', "%{$s}%")
                  ->orWhere('telefono', 'like', "%{$s}%")
                  ->orWhere('rfc', 'like', "%{$s}%")
            );
        }

        if ($request->filled('ruta_id')) {
            $query->where('ruta_id', $request->ruta_id);
        }

        if ($request->filled('zona_id')) {
            $query->where('zona_id', $request->zona_id);
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        if ($request->boolean('con_deuda')) {
            $query->conDeuda();
        }

        $clientes = $query->orderBy('nombre')
            ->paginate($request->integer('per_page', 25));

        return response()->json([
            'data' => $clientes->map(fn($c) => $this->formatCliente($c)),
            'meta' => [
                'total'     => $clientes->total(),
                'page'      => $clientes->currentPage(),
                'last_page' => $clientes->lastPage(),
                'from'      => $clientes->firstItem(),
                'to'        => $clientes->lastItem(),
            ],
        ]);
    }

    public function store(StoreClienteRequest $request)
    {
        $cliente = Cliente::create($request->validated());

        return response()->json([
            'data'    => $this->formatCliente($cliente->load(['ruta', 'zona', 'listaPrecio'])),
            'message' => 'Cliente creado correctamente.',
        ], 201);
    }

    public function show(Cliente $cliente)
    {
        $cliente->load(['ruta', 'zona', 'listaPrecio', 'envases.tipoEnvase']);

        return response()->json(['data' => $this->formatCliente($cliente, true)]);
    }

    public function update(UpdateClienteRequest $request, Cliente $cliente)
    {
        $cliente->update($request->validated());

        return response()->json([
            'data'    => $this->formatCliente($cliente->load(['ruta', 'zona', 'listaPrecio'])),
            'message' => 'Cliente actualizado correctamente.',
        ]);
    }

    public function destroy(Cliente $cliente)
    {
        if ($cliente->saldo_pendiente > 0) {
            return response()->json([
                'message' => 'No se puede eliminar un cliente con saldo pendiente.',
            ], 422);
        }

        $cliente->delete();

        return response()->json(['message' => 'Cliente eliminado correctamente.']);
    }

    public function estadoCuenta(Cliente $cliente)
    {
        $cliente->load(['envases.tipoEnvase']);

        return response()->json([
            'data' => [
                'cliente'         => $cliente->nombre,
                'saldo_pendiente' => $cliente->saldo_pendiente,
                'credito_limite'  => $cliente->credito_limite,
                'credito_dias'    => $cliente->credito_dias,
                'credito_disponible' => max(0, $cliente->credito_limite - $cliente->saldo_pendiente),
                'envases'         => $cliente->envases->map(fn($e) => [
                    'tipo'               => $e->tipoEnvase->nombre,
                    'prestados'          => $e->cantidad_prestada,
                    'devueltos'          => $e->cantidad_devuelta,
                    'saldo'              => $e->saldo,
                ]),
            ],
        ]);
    }

    private function formatCliente(Cliente $c, bool $detail = false): array
    {
        $data = [
            'id'              => $c->id,
            'codigo'          => $c->codigo,
            'nombre'          => $c->nombre,
            'rfc'             => $c->rfc,
            'telefono'        => $c->telefono,
            'email'           => $c->email,
            'direccion'       => $c->direccion,
            'colonia'         => $c->colonia,
            'municipio'       => $c->municipio,
            'estado'          => $c->estado,
            'cp'              => $c->cp,
            'activo'          => $c->activo,
            'credito_limite'  => $c->credito_limite,
            'credito_dias'    => $c->credito_dias,
            'saldo_pendiente' => $c->saldo_pendiente,
            'lat'             => $c->lat,
            'lng'             => $c->lng,
            'notas'           => $c->notas,
            'ruta'            => $c->ruta ? ['id' => $c->ruta->id, 'nombre' => $c->ruta->nombre] : null,
            'zona'            => $c->zona ? ['id' => $c->zona->id, 'nombre' => $c->zona->nombre] : null,
            'lista_precio'    => $c->listaPrecio ? ['id' => $c->listaPrecio->id, 'nombre' => $c->listaPrecio->nombre] : null,
            'created_at'      => $c->created_at,
        ];

        if ($detail && $c->relationLoaded('envases')) {
            $data['envases'] = $c->envases->map(fn($e) => [
                'tipo'      => $e->tipoEnvase->nombre,
                'prestados' => $e->cantidad_prestada,
                'devueltos' => $e->cantidad_devuelta,
                'saldo'     => $e->saldo,
            ]);
        }

        return $data;
    }
}
