<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- (1) Importa esto

class Evaluacion extends Model
{
    use HasFactory;

    /**
     * (2) Añadimos esta variable $fillable
     * Define los campos que SÍ se pueden guardar masivamente desde un formulario.
     */
    protected $fillable = [
        'curso_id',
        'nombre_personalizado',
        'peso',
        'nota',
    ];

    /**
     * (3) Añadimos la relación
     * Una Evaluación pertenece a un Curso
     */
    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }
}