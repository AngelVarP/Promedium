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

            // ¡'ESTE 'ES 'EL 'CAMBIO' 'BRAVO'!
            // 'Ya 'no 'es `curso_id`'. 'Ahora' 'es 'el 'ID' 'de 'la 'tabla' 'puente'.
            $table->foreignId('ciclo_curso_id')
                  ->constrained('ciclo_curso') // 'Apunta' 'a 'la 'tabla' 'nueva'
                  ->onDelete('cascade');

            $table->string('nombre_personalizado');
            $table->decimal('peso', 5, 4); 
            $table->decimal('nota', 4, 2)->nullable(); 

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
