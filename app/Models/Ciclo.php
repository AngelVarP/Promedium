<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // <-- ¡'CAMBIO' 'AQUÍ'!

class Ciclo extends Model
{
    use HasFactory;

    /**
     * 'Los 'campos' 'que 'se 'pueden' 'llenar'.
     */
    protected $fillable = [
        'nombre',
    ];

    /**
     * ¡'LA 'RELACIÓN' 'PRO'!
     * 'Un 'Ciclo' 'pertenece' 'a 'Muchos' 'Cursos'.
     * 'Le 'decimos' 'que 'la 'tabla' 'puente' 'es 'ciclo_curso'.
     */
    public function cursos(): BelongsToMany
    {
        return $this->belongsToMany(Curso::class, 'ciclo_curso');
    }
}