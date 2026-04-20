<?php

namespace App\Http\Controllers\Api\V1;

class ZonaController extends CatalogoController
{
    protected function model(): string { return \App\Models\Zona::class; }
}
