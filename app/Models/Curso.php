<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany; // <-- ¡'Importe' 'nuevo'!

class Curso extends Model
{
    use HasFactory;

    /**
     * ¡'NUEVO'! 'Los 'campos' 'que 'se 'pueden' 'llenar' 'de 'golpe'.
     * (Aquí 'metemos' 'el 'codigo' 'que 'pediste')
     */
    protected $fillable = [
        'codigo',
        'nombre_curso',
        'creditos',
    ];

    /**
     * ¡'LA 'RELACIÓN' 'PRO'!
     * 'Un 'Curso' 'pertenece' 'a 'Muchos' 'Ciclos'.
     * 'Le 'decimos' 'que 'la 'tabla' 'puente' 'es 'ciclo_curso'.
     */
    public function ciclos(): BelongsToMany
    {
        return $this->belongsToMany(Ciclo::class, 'ciclo_curso');
    }

    // ¡'OJO'! 'VOLAMOS' 'LA 'FUNCIÓN' 'evaluaciones()' 'QUE 'ESTABA' 'AQUÍ'.
    // 'YA 'NO 'VA' 'MÁS', 'AHORA' 'CUELGA' 'DE `CicloCurso`'.
}