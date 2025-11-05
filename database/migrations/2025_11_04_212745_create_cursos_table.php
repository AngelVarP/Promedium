<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cursos', function (Blueprint $table) {
            $table->id();

            // 1. La llave foránea para conectarlo a un Ciclo
            $table->foreignId('ciclo_id')
                  ->constrained('ciclos') // 'constrained' le dice a Laravel que esta llave apunta a la tabla 'ciclos'
                  ->onDelete('cascade'); // Si borras un ciclo, se borran sus cursos (opcional, pero recomendado)

            // 2. Los datos del curso
            $table->string('nombre_curso');
            $table->integer('creditos');
            $table->decimal('nota_aprobatoria', 4, 2)->default(10.00); // 4 dígitos en total, 2 después del decimal

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cursos');
    }
};
