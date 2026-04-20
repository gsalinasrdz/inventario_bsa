<?php

namespace App\Http\Controllers\Api\V1;

class TipoEnvaseController extends CatalogoController
{
    protected function model(): string { return \App\Models\TipoEnvase::class; }

    protected function tableName(): string { return 'tipos_envase'; }
}
