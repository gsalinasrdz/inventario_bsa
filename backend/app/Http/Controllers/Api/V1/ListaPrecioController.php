<?php

namespace App\Http\Controllers\Api\V1;

class ListaPrecioController extends CatalogoController
{
    protected function model(): string { return \App\Models\ListaPrecio::class; }

    protected function tableName(): string { return 'listas_precios'; }
}
