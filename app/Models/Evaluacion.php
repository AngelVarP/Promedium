<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluacion extends Model
{
    use HasFactory;

    /**
     * ¡'FILLABLE' 'CORREGIDO'!
     * 'Le 'decimos' 'que 'ahora' 'acepte' 'el 'ID' 'de 'la 'tabla' 'puente'.
     */
    protected $fillable = [
        'ciclo_curso_id', // <-- ¡'CAMBIO' 'CLAVE'!
        'nombre_personalizado',
        'peso',
        'nota',
    ];

    /**
     * ¡'RELACIÓN' 'CORREGIDA'!
     * 'Una 'Evaluación' 'le 'pertenece' 'a 'UNA' 'instancia' 'de 'CicloCurso'.
     */
    public function cicloCurso(): BelongsTo
    {
        return $this->belongsTo(CicloCurso::class);
    }

    // ¡'VOLAMOS' 'LA 'FUNCIÓN' 'curso()' 'ANTIGUA'!
}