<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@grupohls.mx'],
            [
                'nombre'   => 'Administrador',
                'apellido' => 'Sistema',
                'password' => Hash::make('Admin2024!HLS'),
                'activo'   => true,
            ]
        );

        $admin->assignRole('ADMIN');

        $this->command->info("✓ Usuario admin creado: admin@grupohls.mx");
        $this->command->warn("  ⚠ Cambia la contraseña después del primer login.");
    }
}
