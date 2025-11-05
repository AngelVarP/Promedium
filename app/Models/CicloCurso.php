<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CicloCurso extends Model
{
    use HasFactory;

    /**
     * 'Le 'decimos' 'a 'Laravel' 'que 'la 'tabla' 'se 'llama' 'así' 'en 'minúscula' 'y 'singular'.
     */
    protected $table = 'ciclo_curso';

    /**
     * 'Los 'campos' 'que 'se 'pueden' 'llenar' 'de 'golpe'.
     */
    protected $fillable = [
        'ciclo_id',
        'curso_id',
    ];

    /**
     * 'Esta 'instancia' 'le 'pertenece' 'a 'UN 'Ciclo'.
     */
    public function ciclo(): BelongsTo
    {
        return $this->belongsTo(Ciclo::class);
    }

    /**
     * 'Esta 'instancia' 'le 'pertenece' 'a 'UN 'Curso'.
     */
    public function curso(): BelongsTo
    {
        return $this->belongsTo(Curso::class);
    }

    /**
     * 'Esta 'instancia' 'TIENE 'MUCHAS' 'Evaluaciones'.
     * 'Este 'es 'el 'cambio' 'bravo'.
     */
    public function evaluaciones(): HasMany
    {
        return $this->hasMany(Evaluacion::class);
    }
}