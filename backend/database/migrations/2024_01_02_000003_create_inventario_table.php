<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Stock actual por producto + almacén
        Schema::create('stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos')->cascadeOnDelete();
            $table->foreignId('almacen_id')->constrained('almacenes')->cascadeOnDelete();
            $table->decimal('cantidad', 12, 3)->default(0);
            $table->decimal('cantidad_reservada', 12, 3)->default(0);
            $table->timestamp('ultima_actualizacion')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();

            $table->unique(['producto_id', 'almacen_id']);
            $table->index(['producto_id']);
        });

        // Registro inmutable de TODOS los movimientos de inventario
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();
            $table->foreignId('producto_id')->constrained('productos');
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->enum('tipo_movimiento', [
                'ENTRADA_COMPRA',
                'SALIDA_VENTA',
                'SALIDA_CARGA',
                'ENTRADA_DEVOLUCION',
                'ENTRADA_AJUSTE',
                'SALIDA_AJUSTE',
                'SALIDA_MERMA',
                'ENTRADA_SOBRANTE_CARGA',
                'TRASLADO_ENTRADA',
                'TRASLADO_SALIDA',
            ]);
            $table->decimal('cantidad', 12, 3);
            $table->decimal('cantidad_anterior', 12, 3);
            $table->decimal('cantidad_posterior', 12, 3);
            $table->decimal('costo_unitario', 10, 4)->nullable();

            // Relación polimórfica: origen del movimiento
            $table->string('origen_type', 100)->nullable();
            $table->unsignedBigInteger('origen_id')->nullable();

            $table->foreignId('user_id')->constrained('users');
            $table->string('referencia', 50)->nullable();
            $table->text('observaciones')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['producto_id', 'almacen_id', 'created_at']);
            $table->index(['tipo_movimiento', 'created_at']);
            $table->index(['origen_type', 'origen_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
        Schema::dropIfExists('stock');
    }
};
