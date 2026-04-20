<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordenes_compra', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 30)->unique();
            $table->foreignId('proveedor_id')->constrained('proveedores');
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->enum('estado', ['BORRADOR', 'ENVIADA', 'PARCIAL', 'COMPLETA', 'CANCELADA'])
                  ->default('BORRADOR');
            $table->date('fecha_esperada')->nullable();
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('descuento', 14, 2)->default(0);
            $table->decimal('iva', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index('estado');
            $table->index('proveedor_id');
            $table->index(['created_at']);
        });

        Schema::create('detalle_orden_compra', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orden_compra_id')->constrained('ordenes_compra')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad_solicitada', 10, 3);
            $table->decimal('cantidad_recibida', 10, 3)->default(0);
            $table->decimal('precio_unitario', 12, 4);
            $table->decimal('descuento_pct', 5, 2)->default(0);
            $table->decimal('subtotal', 14, 2)->virtualAs('cantidad_solicitada * precio_unitario * (1 - descuento_pct / 100)');
            $table->timestamps();

            $table->index('producto_id');
        });

        Schema::create('recepciones', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 30)->unique();
            $table->foreignId('orden_compra_id')->nullable()->constrained('ordenes_compra')->nullOnDelete();
            $table->foreignId('proveedor_id')->constrained('proveedores');
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->enum('estado', ['PENDIENTE', 'PROCESADA', 'ANULADA'])->default('PENDIENTE');
            $table->string('referencia_proveedor', 60)->nullable();
            $table->date('fecha_recepcion');
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index('orden_compra_id');
            $table->index('estado');
            $table->index('fecha_recepcion');
        });

        Schema::create('detalle_recepcion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recepcion_id')->constrained('recepciones')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->foreignId('detalle_orden_id')->nullable()->constrained('detalle_orden_compra')->nullOnDelete();
            $table->decimal('cantidad', 10, 3);
            $table->decimal('precio_unitario', 12, 4);
            $table->string('lote', 60)->nullable();
            $table->date('fecha_vencimiento')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_recepcion');
        Schema::dropIfExists('recepciones');
        Schema::dropIfExists('detalle_orden_compra');
        Schema::dropIfExists('ordenes_compra');
    }
};
