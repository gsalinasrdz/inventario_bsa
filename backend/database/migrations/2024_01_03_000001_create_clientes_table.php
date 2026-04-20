<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->string('nombre_comercial', 150);
            $table->string('razon_social', 200)->nullable();
            $table->string('rfc', 13)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('direccion')->nullable();
            $table->string('colonia', 100)->nullable();
            $table->string('municipio', 100)->nullable();
            $table->string('estado_geo', 100)->nullable();
            $table->string('codigo_postal', 10)->nullable();

            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->foreignId('lista_precio_id')->nullable()->constrained('listas_precios')->nullOnDelete();

            $table->enum('tipo', ['MAYORISTA', 'DISTRIBUIDOR', 'MENUDEO'])->default('MENUDEO');
            $table->decimal('credito_limite', 12, 2)->default(0);
            $table->decimal('saldo_pendiente', 12, 2)->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['ruta_id', 'activo']);
            $table->index(['tipo']);
        });

        Schema::create('envases_cliente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('tipo_envase_id')->constrained('tipos_envase')->cascadeOnDelete();
            $table->integer('saldo_envases')->default(0);
            $table->timestamps();

            $table->unique(['cliente_id', 'tipo_envase_id']);
        });

        Schema::create('vehiculos', function (Blueprint $table) {
            $table->id();
            $table->string('placas', 20)->unique();
            $table->string('marca', 50)->nullable();
            $table->string('modelo', 50)->nullable();
            $table->unsignedSmallInteger('anio')->nullable();
            $table->decimal('capacidad_kg', 8, 2)->nullable();
            $table->unsignedInteger('capacidad_unidades')->nullable();
            $table->enum('estado', ['DISPONIBLE', 'EN_RUTA', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO'])
                ->default('DISPONIBLE');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehiculos');
        Schema::dropIfExists('envases_cliente');
        Schema::dropIfExists('clientes');
    }
};
