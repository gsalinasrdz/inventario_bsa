<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── PEDIDOS (preventa) ────────────────────────────────────────────
        Schema::create('pedidos', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 30)->unique();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->foreignId('lista_precio_id')->nullable()->constrained('listas_precios')->nullOnDelete();
            $table->enum('estado', ['PENDIENTE', 'CONFIRMADO', 'EN_RUTA', 'ENTREGADO', 'CANCELADO'])
                  ->default('PENDIENTE');
            $table->date('fecha_entrega')->nullable();
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('descuento', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index('cliente_id');
            $table->index('estado');
            $table->index('fecha_entrega');
            $table->index('ruta_id');
        });

        Schema::create('detalle_pedido', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad', 10, 3);
            $table->decimal('precio_unitario', 12, 4);
            $table->decimal('descuento_pct', 5, 2)->default(0);
            $table->timestamps();
        });

        // ── VENTAS ────────────────────────────────────────────────────────
        Schema::create('ventas', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 30)->unique();
            $table->foreignId('cliente_id')->constrained('clientes');
            $table->foreignId('usuario_id')->constrained('users');
            $table->foreignId('pedido_id')->nullable()->constrained('pedidos')->nullOnDelete();
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->foreignId('lista_precio_id')->nullable()->constrained('listas_precios')->nullOnDelete();
            $table->enum('estado', ['PENDIENTE', 'COBRADA', 'CANCELADA'])->default('PENDIENTE');
            $table->enum('tipo_pago', ['CONTADO', 'CREDITO', 'TRANSFERENCIA', 'CHEQUE'])->default('CONTADO');
            $table->date('fecha_venta');
            $table->date('fecha_vencimiento')->nullable();
            $table->decimal('subtotal', 14, 2)->default(0);
            $table->decimal('descuento', 14, 2)->default(0);
            $table->decimal('iva', 14, 2)->default(0);
            $table->decimal('total', 14, 2)->default(0);
            $table->decimal('pagado', 14, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index('cliente_id');
            $table->index('estado');
            $table->index('fecha_venta');
            $table->index('usuario_id');
        });

        Schema::create('detalle_venta', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venta_id')->constrained('ventas')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad', 10, 3);
            $table->decimal('precio_unitario', 12, 4);
            $table->decimal('descuento_pct', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detalle_venta');
        Schema::dropIfExists('ventas');
        Schema::dropIfExists('detalle_pedido');
        Schema::dropIfExists('pedidos');
    }
};
