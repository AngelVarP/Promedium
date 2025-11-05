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
        Schema::create('evaluaciones', function (Blueprint $table) {
            $table->id();

            // 1. Pa' saber de qué curso es esta nota
            $table->foreignId('curso_id')
                  ->constrained('cursos')
                  ->onDelete('cascade'); // Si vuelas el curso, vuelan sus notas

            // 2. Los datos de la evaluación
            $table->string('nombre_personalizado'); // Aquí pones "PC1", "Examen Final", "Trabajo", etc.
            $table->decimal('peso', 5, 4); // (5,4) pa' guardar 0.3000 (30%) o 0.1250 (12.5%)
            
            // 3. La nota (¡esta es la importante!)
            $table->decimal('nota', 4, 2)->nullable(); // (4,2) pa' 20.00 o 10.50. 'nullable' es CLAVE.

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluacions');
    }
};
