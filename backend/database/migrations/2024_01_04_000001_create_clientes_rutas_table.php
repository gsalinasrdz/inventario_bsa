<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        Schema::dropIfExists('vehiculos');
        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('placa', 20)->unique();
            $table->string('marca', 60);
            $table->string('modelo', 60);
            $table->unsignedSmallInteger('anio');
            $table->unsignedInteger('capacidad_cajas')->default(0);
            $table->boolean('activo')->default(true);
            $table->text('notas')->nullable();
            $table->timestamps();
        });

        Schema::table('rutas', function (Blueprint $table) {
            if (!Schema::hasColumn('rutas', 'vehiculo_id')) {
                $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            }
            if (!Schema::hasColumn('rutas', 'repartidor_id')) {
                $table->foreignId('repartidor_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('rutas', 'dia_visita')) {
                $table->string('dia_visita', 50)->nullable();
            }
        });

        Schema::dropIfExists('clientes');
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 30)->unique();
            $table->string('nombre', 150);
            $table->string('rfc', 13)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 120)->nullable();
            $table->string('direccion', 255)->nullable();
            $table->string('colonia', 100)->nullable();
            $table->string('municipio', 100)->nullable();
            $table->string('estado', 60)->nullable();
            $table->string('cp', 10)->nullable();
            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->foreignId('zona_id')->nullable()->constrained('zonas')->nullOnDelete();
            $table->foreignId('lista_precio_id')->nullable()->constrained('listas_precios')->nullOnDelete();
            $table->decimal('credito_limite', 12, 2)->default(0);
            $table->unsignedTinyInteger('credito_dias')->default(0);
            $table->decimal('saldo_pendiente', 12, 2)->default(0);
            $table->boolean('activo')->default(true);
            $table->text('notas')->nullable();
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->index('nombre');
            $table->index('activo');
            $table->index('ruta_id');
        });

        Schema::dropIfExists('envases_cliente');
        Schema::create('envases_cliente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('tipo_envase_id')->constrained('tipos_envase');
            $table->unsignedInteger('cantidad_prestada')->default(0);
            $table->unsignedInteger('cantidad_devuelta')->default(0);
            $table->timestamps();

            $table->unique(['cliente_id', 'tipo_envase_id']);
        });

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('envases_cliente');
        Schema::dropIfExists('clientes');
        Schema::table('rutas', function (Blueprint $table) {
            $table->dropForeign(['vehiculo_id']);
            $table->dropForeign(['repartidor_id']);
            $table->dropColumn(['vehiculo_id', 'repartidor_id', 'dia_visita']);
        });
        Schema::dropIfExists('vehiculos');
        Schema::enableForeignKeyConstraints();
    }
};
