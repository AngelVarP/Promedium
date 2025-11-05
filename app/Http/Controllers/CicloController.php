<?php

namespace App\Http\Controllers;

use App\Models\Ciclo; // <-- (1) ¡Importante! Traemos el Modelo
use Illuminate\Http\Request;
use Illuminate\View\View; // <-- (2) Importamos la 'View' pa' que sepa qué retornar

class CicloController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View // <-- (3) Le decimos que esta función SÍ O SÍ devuelve una Vista
    {
        // (4) Esta es la magia:
        // Va al modelo Ciclo y le dice "dame todo lo que tengas"
        // y lo ordena por el más nuevo (desc)
        $ciclos = Ciclo::latest()->get(); 

        // (5) Retorna la vista y le pasa los datos:
        // "Oye vista 'ciclos.index', toma esta variable $ciclos y muéstrala"
        return view('ciclos.index', [
            'ciclos' => $ciclos,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // Aún no lo usamos
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Aún no lo usamos
    }
    
    // ... (El resto de funciones quedan vacías por ahora)
}