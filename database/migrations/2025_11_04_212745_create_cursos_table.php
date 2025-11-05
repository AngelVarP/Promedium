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
            
            // ¡'LE 'AÑADIMOS' 'EL 'CÓDIGO' 'QUE 'PEDISTE'!
            $table->string('codigo')->unique(); // 'Ej: 'MAT101'
            
            $table->string('nombre_curso');
            $table->integer('creditos');

            // ¡'YA 'NO 'HAY' `ciclo_id`! 'LO 'VOLAMOS'.

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
