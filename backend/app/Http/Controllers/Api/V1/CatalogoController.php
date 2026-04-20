<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

/**
 * Controlador base para catálogos simples (CRUD estándar).
 * Extienden este para heredar index/store/show/update/destroy.
 */
abstract class CatalogoController extends Controller
{
    abstract protected function model(): string;

    protected function tableName(): string
    {
        return app($this->model())->getTable();
    }

    public function index(Request $request)
    {
        /** @var Model $model */
        $model = app($this->model());
        $query = $model::query();

        if ($request->filled('search')) {
            $query->where('nombre', 'like', "%{$request->search}%");
        }

        if ($request->has('activo')) {
            $query->where('activo', $request->boolean('activo'));
        }

        $all = $request->boolean('all', false);
        $items = $all
            ? $query->orderBy('nombre')->get()
            : $query->orderBy('nombre')->paginate($request->integer('per_page', 50));

        if ($all) {
            return response()->json(['data' => $items]);
        }

        return response()->json([
            'data' => $items->items(),
            'meta' => [
                'total'     => $items->total(),
                'page'      => $items->currentPage(),
                'last_page' => $items->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());
        /** @var Model $model */
        $model = app($this->model());
        $item  = $model::create($validated);

        return response()->json(['data' => $item, 'message' => 'Registrado correctamente.'], 201);
    }

    public function show(int $id)
    {
        $model = app($this->model());
        return response()->json(['data' => $model::findOrFail($id)]);
    }

    public function update(Request $request, int $id)
    {
        $model = app($this->model());
        $item  = $model::findOrFail($id);
        $item->update($request->validate($this->rules($id)));

        return response()->json(['data' => $item, 'message' => 'Actualizado correctamente.']);
    }

    public function destroy(int $id)
    {
        $model = app($this->model());
        $item  = $model::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Eliminado correctamente.']);
    }

    protected function rules(int $id = 0): array
    {
        $table  = $this->tableName();
        $unique = $id ? "unique:{$table},nombre,{$id}" : "unique:{$table},nombre";

        return [
            'nombre'      => "required|string|max:100|{$unique}",
            'descripcion' => 'nullable|string|max:255',
            'activo'      => 'boolean',
        ];
    }
}
