<?php

namespace App\Http\Controllers\Api\V1;

class MarcaController extends CatalogoController
{
    protected function model(): string { return \App\Models\Marca::class; }
}
