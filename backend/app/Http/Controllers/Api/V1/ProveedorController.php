<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Proveedor;
use Illuminate\Http\Request;

class ProveedorController extends CatalogoController
{
    protected function model(): string { return Proveedor::class; }

    protected function rules(int $id = 0): array
    {
        $unique = $id ? "unique:proveedores,razon_social,{$id}" : 'unique:proveedores,razon_social';

        return [
            'razon_social' => "required|string|max:150|{$unique}",
            'nombre'       => 'nullable|string|max:100',
            'rfc'          => 'nullable|string|max:13',
            'telefono'     => 'nullable|string|max:20',
            'email'        => 'nullable|email|max:120',
            'direccion'    => 'nullable|string|max:255',
            'activo'       => 'boolean',
        ];
    }

    public function index(Request $request)
    {
        $query = Proveedor::query();

        if ($request->filled('search')) {
            $query->where('razon_social', 'like', "%{$request->search}%");
        }

        $items = $query->orderBy('razon_social')->get();

        return response()->json(['data' => $items]);
    }
}
