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
        Schema::create('ciclo_curso', function (Blueprint $table) {
            $table->id(); // 'Este 'es 'el 'ID' 'de 'la 'inscripción''
            
            // 'El 'ID' 'del 'Ciclo'
            $table->foreignId('ciclo_id')
                  ->constrained('ciclos')
                  ->onDelete('cascade');
            
            // 'El 'ID' 'del 'Curso'
            $table->foreignId('curso_id')
                  ->constrained('cursos')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ciclo_curso');
    }
};
