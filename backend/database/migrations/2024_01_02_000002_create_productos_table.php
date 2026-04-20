<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_sku', 50)->unique();
            $table->string('codigo_barras', 50)->nullable()->unique();
            $table->string('nombre', 200);
            $table->text('descripcion')->nullable();

            $table->foreignId('categoria_id')->constrained('categorias');
            $table->foreignId('marca_id')->constrained('marcas');
            $table->foreignId('presentacion_id')->constrained('presentaciones');
            $table->foreignId('tipo_envase_id')->nullable()->constrained('tipos_envase')->nullOnDelete();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores')->nullOnDelete();

            $table->boolean('es_retornable')->default(false);
            $table->decimal('peso_kg', 8, 3)->nullable();

            // Control de inventario
            $table->decimal('stock_minimo', 12, 3)->default(0);
            $table->decimal('stock_maximo', 12, 3)->nullable();

            // Imagen principal
            $table->string('imagen_principal', 500)->nullable();

            $table->enum('estado', ['ACTIVO', 'INACTIVO', 'DESCONTINUADO'])->default('ACTIVO');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['codigo_sku']);
            $table->index(['categoria_id', 'estado']);
            $table->index(['estado']);
        });

        Schema::create('producto_imagenes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->string('ruta', 500);
            $table->boolean('es_principal')->default(false);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('producto_precios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('lista_precio_id')->constrained('listas_precios')->cascadeOnDelete();
            $table->decimal('precio', 10, 4);
            $table->timestamps();

            $table->unique(['producto_id', 'lista_precio_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('producto_precios');
        Schema::dropIfExists('producto_imagenes');
        Schema::dropIfExists('productos');
    }
};
