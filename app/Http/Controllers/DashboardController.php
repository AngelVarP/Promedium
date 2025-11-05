<?php

namespace App\Http\Controllers;

use App\Models\Ciclo; // <-- (1) ¡'Importamos' (Importamos) 'el 'Modelo'' (el Modelo) 'pa' (para) 'la 'consulta'' (la consulta)!
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    /**
     * 'Muestra' (Muestra) 'el 'dashboard' (el dashboard) 'principal' (principal) 'de 'la 'app'' (de la app).
     */
    public function index(): View
    {
        // (2) 'Buscamos' (Buscamos) 'el 'último' (el último) 'ciclo' (ciclo) 'creado' (creado). 'Asumimos' (Asumimos) 'que 'ese'' (que ese) 'es 'el 'actual'' (es el actual).
        $cicloActual = Ciclo::latest()->first();
        $cursosActuales = [];

        if ($cicloActual) {
            // (3) 'Si 'encontramos' (Si encontramos) 'un 'ciclo'' (un ciclo), 'jalamos' (obtenemos) 'sus 'cursos'' (sus cursos).
            $cursosActuales = $cicloActual->cursos()->get();
        }

        // (4) 'Le 'pasamos' (Le pasamos) 'los 'datos'' (los datos) 'a 'la 'vista'' (a la vista).
        return view('dashboard.index', [
            'cicloActual' => $cicloActual,
            'cursosActuales' => $cursosActuales,
            // 'Aquí' (Aquí) 'luego' (luego) 'van' (van) 'las 'stats'' (las estadísticas) 'de 'verdad' (de verdad)
        ]);
    }
}