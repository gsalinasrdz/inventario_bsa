<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargas', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->foreignId('ruta_id')->nullable()->constrained('rutas')->nullOnDelete();
            $table->foreignId('vehiculo_id')->nullable()->constrained('vehiculos')->nullOnDelete();
            $table->foreignId('usuario_id')->constrained('users');   // repartidor asignado
            $table->foreignId('almacen_id')->constrained('almacenes');
            $table->date('fecha_carga');
            $table->enum('estado', ['PREPARACION', 'EN_RUTA', 'LIQUIDADA', 'CANCELADA'])->default('PREPARACION');
            $table->text('notas')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('detalle_carga', function (Blueprint $table) {
            $table->id();
            $table->foreignId('carga_id')->constrained('cargas')->cascadeOnDelete();
            $table->foreignId('producto_id')->constrained('productos');
            $table->decimal('cantidad_cargada',  10, 3);
            $table->decimal('cantidad_vendida',   10, 3)->default(0);
            $table->decimal('cantidad_devuelta',  10, 3)->default(0);
            $table->decimal('precio_unitario',    10, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('liquidaciones', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 20)->unique();
            $table->foreignId('carga_id')->constrained('cargas');
            $table->foreignId('usuario_id')->constrained('users');
            $table->date('fecha_liquidacion');
            $table->decimal('efectivo_esperado', 12, 2)->default(0);
            $table->decimal('efectivo_recibido', 12, 2)->default(0);
            $table->text('notas')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('liquidaciones');
        Schema::dropIfExists('detalle_carga');
        Schema::dropIfExists('cargas');
    }
};
