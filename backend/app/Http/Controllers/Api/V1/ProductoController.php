<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Producto\StoreProductoRequest;
use App\Http\Requests\Producto\UpdateProductoRequest;
use App\Http\Resources\Producto\ProductoResource;
use App\Http\Resources\Producto\ProductoCollection;
use App\Models\Producto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductoController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Producto::class, 'producto');
    }

    public function index(Request $request): JsonResponse
    {
        $query = Producto::with(['categoria', 'marca', 'presentacion', 'proveedor'])
            ->withSum(['stock as stock_total' => fn($q) => $q], 'cantidad');

        // Filtros
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nombre', 'like', "%{$search}%")
                  ->orWhere('codigo_sku', 'like', "%{$search}%")
                  ->orWhere('codigo_barras', 'like', "%{$search}%");
            });
        }

        if ($categoriaId = $request->input('categoria_id')) {
            $query->where('categoria_id', $categoriaId);
        }

        if ($estado = $request->input('estado')) {
            $query->where('estado', $estado);
        }

        if ($request->boolean('stock_bajo')) {
            $query->whereHas('stock', fn($q) =>
                $q->whereColumn('cantidad', '<=', 'productos.stock_minimo')
            );
        }

        $productos = $query
            ->orderBy($request->input('sort_by', 'nombre'), $request->input('sort_dir', 'asc'))
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data'    => ProductoResource::collection($productos->items()),
            'meta'    => [
                'total'        => $productos->total(),
                'per_page'     => $productos->perPage(),
                'current_page' => $productos->currentPage(),
                'last_page'    => $productos->lastPage(),
            ],
        ]);
    }

    public function store(StoreProductoRequest $request): JsonResponse
    {
        $producto = Producto::create($request->validated());

        // Crear registros de precio para cada lista activa
        if ($request->has('precios')) {
            foreach ($request->input('precios') as $listaPrecioId => $precio) {
                $producto->precios()->create([
                    'lista_precio_id' => $listaPrecioId,
                    'precio'          => $precio,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => new ProductoResource($producto->load(['categoria', 'marca', 'presentacion', 'precios.listaPrecio'])),
            'message' => 'Producto creado correctamente.',
        ], 201);
    }

    public function show(Producto $producto): JsonResponse
    {
        $producto->load([
            'categoria', 'marca', 'presentacion', 'tipoEnvase',
            'proveedor', 'imagenes', 'precios.listaPrecio',
        ]);
        $producto->loadSum(['stock as stock_total' => fn($q) => $q], 'cantidad');

        return response()->json([
            'success' => true,
            'data'    => new ProductoResource($producto),
        ]);
    }

    public function update(UpdateProductoRequest $request, Producto $producto): JsonResponse
    {
        $producto->update($request->validated());

        if ($request->has('precios')) {
            foreach ($request->input('precios') as $listaPrecioId => $precio) {
                $producto->precios()->updateOrCreate(
                    ['lista_precio_id' => $listaPrecioId],
                    ['precio'          => $precio]
                );
            }
        }

        return response()->json([
            'success' => true,
            'data'    => new ProductoResource($producto->load(['categoria', 'marca', 'presentacion', 'precios.listaPrecio'])),
            'message' => 'Producto actualizado correctamente.',
        ]);
    }

    public function destroy(Producto $producto): JsonResponse
    {
        $producto->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto desactivado correctamente.',
        ]);
    }

    public function stockBajo(Request $request): JsonResponse
    {
        $productos = Producto::with(['categoria', 'stock'])
            ->activos()
            ->conStockBajo()
            ->get();

        return response()->json([
            'success' => true,
            'data'    => ProductoResource::collection($productos),
            'meta'    => ['total' => $productos->count()],
        ]);
    }
}
