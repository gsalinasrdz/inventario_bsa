<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Devoluciones ────────────────────────────────────────────────
        Schema::create('devoluciones', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->foreignId('cliente_id')->nullable()->constrained('clientes')->nullOnDelete();
            $table->foreignId('venta_id')->nullable()->constrained('ventas')->nullOnDelete();
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->date('fecha_devolucion');
            $table->enum('estado', ['PENDIENTE', 'APROBADA', 'RECHAZADA'])->default('PENDIENTE');
            $table->string('motivo', 255)->nullable();
            $table->text('notas')->nullable();
            $table->foreignId('aprobado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('detalle_devolucion', function (Blueprint $table) {
            $table->id();
            $table->foreignId('devolucion_id')->constrained('devoluciones')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad', 10, 3);
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->timestamps();
        });

        // ── Mermas ──────────────────────────────────────────────────────
        Schema::create('mermas', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->date('fecha_merma');
            $table->enum('tipo_merma', ['VENCIMIENTO', 'DAÑO', 'ROBO', 'OTRO'])->default('OTRO');
            $table->enum('estado', ['PENDIENTE', 'APROBADA', 'RECHAZADA'])->default('PENDIENTE');
            $table->text('notas')->nullable();
            $table->foreignId('aprobado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('detalle_merma', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merma_id')->constrained('mermas')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad', 10, 3);
            $table->string('motivo', 255)->nullable();
            $table->timestamps();
        });

        // ── Ajustes de Inventario ───────────────────────────────────────
        Schema::create('ajustes_inventario', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->date('fecha_ajuste');
            $table->enum('tipo', ['ENTRADA', 'SALIDA'])->default('ENTRADA');
            $table->enum('estado', ['PENDIENTE', 'APROBADO', 'RECHAZADO'])->default('PENDIENTE');
            $table->string('motivo', 255);
            $table->text('notas')->nullable();
            $table->foreignId('aprobado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('detalle_ajuste', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ajuste_id')->constrained('ajustes_inventario')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad', 10, 3);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_ajuste');
        Schema::dropIfExists('ajustes_inventario');
        Schema::dropIfExists('detalle_merma');
        Schema::dropIfExists('mermas');
        Schema::dropIfExists('detalle_devolucion');
        Schema::dropIfExists('devoluciones');
    }
};
