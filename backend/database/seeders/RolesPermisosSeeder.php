<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesPermisosSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $guard = 'web';

        // ── PERMISOS ────────────────────────────────────────────────────
        $permisos = [
            // Usuarios
            'usuarios.ver', 'usuarios.crear', 'usuarios.editar', 'usuarios.eliminar',

            // Productos y catálogos
            'productos.ver', 'productos.crear', 'productos.editar', 'productos.eliminar',
            'precios.ver', 'precios.editar',
            'categorias.gestionar', 'marcas.gestionar', 'presentaciones.gestionar',
            'proveedores.gestionar', 'almacenes.gestionar',

            // Clientes y rutas
            'clientes.ver', 'clientes.crear', 'clientes.editar', 'clientes.eliminar',
            'rutas.gestionar', 'flota.gestionar',

            // Inventario
            'inventario.ver', 'inventario.movimientos.ver',

            // Compras
            'compras.ver', 'compras.crear', 'compras.editar', 'compras.eliminar',
            'compras.aprobar', 'compras.recibir',

            // Rutas y flota
            'rutas.ver', 'rutas.crear', 'rutas.editar', 'rutas.eliminar',
            'vehiculos.ver', 'vehiculos.crear', 'vehiculos.editar', 'vehiculos.eliminar',

            // Ventas
            'ventas.ver', 'ventas.ver.propias', 'ventas.crear', 'ventas.cancelar',

            // Pedidos (preventa)
            'pedidos.ver', 'pedidos.crear', 'pedidos.gestionar',

            // Cargas
            'cargas.ver', 'cargas.crear', 'cargas.liquidar',

            // Devoluciones
            'devoluciones.ver', 'devoluciones.crear', 'devoluciones.aprobar',

            // Mermas
            'mermas.ver', 'mermas.crear', 'mermas.aprobar',

            // Ajustes
            'ajustes.ver', 'ajustes.crear', 'ajustes.aprobar',

            // Envases retornables
            'envases.ver', 'envases.gestionar',

            // Reportes
            'reportes.ver', 'reportes.exportar',

            // Auditoría
            'auditlog.ver',
        ];

        foreach ($permisos as $permiso) {
            Permission::firstOrCreate(['name' => $permiso, 'guard_name' => $guard]);
        }

        // ── ROLES Y ASIGNACIÓN DE PERMISOS ──────────────────────────────

        // ADMIN — acceso total
        $admin = Role::firstOrCreate(['name' => 'ADMIN', 'guard_name' => $guard]);
        $admin->syncPermissions(Permission::all());

        // GERENTE — todo excepto usuarios y audit log
        $gerente = Role::firstOrCreate(['name' => 'GERENTE', 'guard_name' => $guard]);
        $gerente->syncPermissions([
            'productos.ver', 'productos.crear', 'productos.editar',
            'precios.ver', 'precios.editar',
            'categorias.gestionar', 'marcas.gestionar', 'presentaciones.gestionar',
            'proveedores.gestionar', 'almacenes.gestionar',
            'clientes.ver', 'clientes.crear', 'clientes.editar',
            'rutas.gestionar', 'flota.gestionar',
            'inventario.ver', 'inventario.movimientos.ver',
            'compras.ver', 'compras.crear', 'compras.aprobar', 'compras.recibir',
            'ventas.ver', 'ventas.crear', 'ventas.cancelar',
            'pedidos.ver', 'pedidos.crear', 'pedidos.gestionar',
            'cargas.ver', 'cargas.crear', 'cargas.liquidar',
            'devoluciones.ver', 'devoluciones.crear', 'devoluciones.aprobar',
            'mermas.ver', 'mermas.crear', 'mermas.aprobar',
            'ajustes.ver', 'ajustes.crear', 'ajustes.aprobar',
            'envases.ver', 'envases.gestionar',
            'reportes.ver', 'reportes.exportar',
        ]);

        // VENDEDOR — captura de ventas y pedidos
        $vendedor = Role::firstOrCreate(['name' => 'VENDEDOR', 'guard_name' => $guard]);
        $vendedor->syncPermissions([
            'productos.ver', 'precios.ver',
            'clientes.ver', 'clientes.crear', 'clientes.editar',
            'inventario.ver',
            'ventas.ver.propias', 'ventas.crear',
            'pedidos.ver', 'pedidos.crear',
            'cargas.ver',
            'devoluciones.ver', 'devoluciones.crear',
            'envases.ver',
        ]);

        // ALMACENISTA — control físico de inventario
        $almacenista = Role::firstOrCreate(['name' => 'ALMACENISTA', 'guard_name' => $guard]);
        $almacenista->syncPermissions([
            'productos.ver',
            'inventario.ver', 'inventario.movimientos.ver',
            'compras.ver', 'compras.crear', 'compras.recibir',
            'cargas.ver', 'cargas.crear', 'cargas.liquidar',
            'devoluciones.ver', 'devoluciones.crear',
            'mermas.ver', 'mermas.crear',
            'ajustes.ver', 'ajustes.crear',
            'envases.ver', 'envases.gestionar',
        ]);

        $this->command->info('✓ Roles y permisos creados correctamente.');
    }
}
