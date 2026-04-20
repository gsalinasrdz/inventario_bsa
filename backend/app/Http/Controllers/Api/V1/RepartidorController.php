<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class RepartidorController extends Controller
{
    public function index(Request $request)
    {
        $repartidores = User::role(['VENDEDOR', 'ALMACENISTA'])
            ->where('activo', true)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return response()->json(['data' => $repartidores]);
    }
}
