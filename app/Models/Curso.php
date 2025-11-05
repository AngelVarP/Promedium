<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // <-- (1) Importa el "padre"
use Illuminate\Database\Eloquent\Relations\HasMany;   // <-- (1) Importa los "hijos"

class Curso extends Model
{
    use HasFactory;

    /**
     * (2) Añade esta función
     * Un Curso pertenece a un Ciclo
     */
    public function ciclo(): BelongsTo
    {
        return $this->belongsTo(Ciclo::class);
    }

    /**
     * (3) Añade esta función
     * Un Curso tiene muchas Evaluaciones
     */
    public function evaluaciones(): HasMany
    {
        return $this->hasMany(Evaluacion::class);
    }
}