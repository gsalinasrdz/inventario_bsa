<?php

namespace App\Http\Controllers\Api\V1;

class CategoriaController extends CatalogoController
{
    protected function model(): string { return \App\Models\Categoria::class; }
}
