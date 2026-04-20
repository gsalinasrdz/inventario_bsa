<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_envase', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('clientes')->cascadeOnDelete();
            $table->foreignId('tipo_envase_id')->constrained('tipos_envase');
            $table->foreignId('usuario_id')->constrained('users');
            // PRESTAMO: enviamos envases al cliente; DEVOLUCION: cliente los regresa
            $table->enum('tipo', ['PRESTAMO', 'DEVOLUCION']);
            $table->unsignedInteger('cantidad');
            // Referencia al documento origen (venta, carga, etc.)
            $table->string('referencia_tipo', 50)->nullable();
            $table->unsignedBigInteger('referencia_id')->nullable();
            $table->text('notas')->nullable();
            $table->timestamps();

            $table->index(['cliente_id', 'tipo_envase_id']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_envase');
    }
};
