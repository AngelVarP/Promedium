<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // <-- (1) Importa esto

class Ciclo extends Model
{
    use HasFactory;

    /**
     * (2) Añade esta función
     * Un Ciclo tiene muchos Cursos
     */
    public function cursos(): HasMany
    {
        return $this->hasMany(Curso::class);
    }
}