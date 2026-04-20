<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UnidadMedidaController extends CatalogoController
{
    protected function model(): string { return \App\Models\UnidadMedida::class; }

    protected function tableName(): string { return 'unidades_medida'; }
}
