<?php

namespace App\Http\Controllers\Api\V1;

class AlmacenController extends CatalogoController
{
    protected function model(): string { return \App\Models\Almacen::class; }
}
