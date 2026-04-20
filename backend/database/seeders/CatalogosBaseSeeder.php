<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CatalogosBaseSeeder extends Seeder
{
    public function run(): void
    {
        // Categorías base para distribuidora de refrescos
        $categorias = [
            ['nombre' => 'Refresco Carbonatado', 'descripcion' => 'Bebidas gaseosas carbonatadas'],
            ['nombre' => 'Agua', 'descripcion' => 'Agua natural y mineral'],
            ['nombre' => 'Jugos y Néctares', 'descripcion' => 'Jugos naturales y néctares'],
            ['nombre' => 'Bebidas Energéticas', 'descripcion' => 'Bebidas energizantes'],
            ['nombre' => 'Bebidas Isotónicas', 'descripcion' => 'Bebidas deportivas'],
            ['nombre' => 'Té y Café', 'descripcion' => 'Tés y cafés embotellados'],
        ];

        foreach ($categorias as $cat) {
            DB::table('categorias')->insertOrIgnore([
                'nombre'      => $cat['nombre'],
                'descripcion' => $cat['descripcion'],
                'activo'      => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // Presentaciones comunes en distribución de refrescos
        $presentaciones = [
            ['nombre' => 'Lata 355ml',    'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 355ml', 'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 600ml', 'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 1L',    'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 1.5L',  'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 2L',    'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 2.5L',  'unidades' => 1,  'es_retornable' => false],
            ['nombre' => 'Botella 3L',    'unidades' => 1,  'es_retornable' => true],
            ['nombre' => 'Garrafón 20L',  'unidades' => 1,  'es_retornable' => true],
            ['nombre' => 'Six Pack Lata', 'unidades' => 6,  'es_retornable' => false],
            ['nombre' => 'Caja 24 pzas',  'unidades' => 24, 'es_retornable' => false],
            ['nombre' => 'Caja 12 pzas',  'unidades' => 12, 'es_retornable' => false],
        ];

        foreach ($presentaciones as $p) {
            DB::table('presentaciones')->insertOrIgnore([
                'nombre'        => $p['nombre'],
                'unidades'      => $p['unidades'],
                'es_retornable' => $p['es_retornable'],
                'activo'        => true,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        // Listas de precios base
        $listas = [
            ['nombre' => 'Precio Lista',        'descripcion' => 'Precio sugerido al consumidor final'],
            ['nombre' => 'Precio Distribuidor', 'descripcion' => 'Precio para distribuidores y mayoristas'],
            ['nombre' => 'Precio Menudeo',      'descripcion' => 'Precio de menudeo para tiendas'],
        ];

        foreach ($listas as $lista) {
            DB::table('listas_precios')->insertOrIgnore([
                'nombre'      => $lista['nombre'],
                'descripcion' => $lista['descripcion'],
                'activo'      => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        // Almacén principal
        DB::table('almacenes')->insertOrIgnore([
            'nombre'      => 'Almacén Principal',
            'descripcion' => 'Bodega central de distribución',
            'activo'      => true,
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        // Tipos de envase retornable
        $envases = [
            ['nombre' => 'Casco Botella 3L',  'valor' => 15.00],
            ['nombre' => 'Garrafón 20L',      'valor' => 80.00],
        ];

        foreach ($envases as $envase) {
            DB::table('tipos_envase')->insertOrIgnore([
                'nombre'     => $envase['nombre'],
                'valor'      => $envase['valor'],
                'activo'     => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Zonas de distribución base
        $zonas = [
            ['nombre' => 'Zona Norte', 'descripcion' => 'Cobertura zona norte de la ciudad'],
            ['nombre' => 'Zona Sur',   'descripcion' => 'Cobertura zona sur de la ciudad'],
            ['nombre' => 'Zona Centro','descripcion' => 'Centro de la ciudad'],
            ['nombre' => 'Zona Oriente','descripcion' => 'Cobertura zona oriente'],
        ];

        foreach ($zonas as $zona) {
            DB::table('zonas')->insertOrIgnore([
                'nombre'      => $zona['nombre'],
                'descripcion' => $zona['descripcion'],
                'activo'      => true,
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        $this->command->info('✓ Catálogos base creados (categorías, presentaciones, listas, almacén, envases, zonas).');
    }
}
