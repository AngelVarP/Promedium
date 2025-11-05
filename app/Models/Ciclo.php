<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ciclo extends Model
{
    use HasFactory;

    /**
     * ¡'LÍNEA' 'NUEVA'!
     * 'Le 'decimos' 'a 'Laravel' 'que 'el 'campo' 'nombre' 'se 'puede' 'llenar' 'sin 'roche''.
     */
    protected $fillable = [
        'nombre',
    ];

    /**
     * 'Un 'Ciclo' 'tiene' 'muchos' 'Cursos'
     */
    public function cursos(): HasMany
    {
        return $this->hasMany(Curso::class);
    }
}