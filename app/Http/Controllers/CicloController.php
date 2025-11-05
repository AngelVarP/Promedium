<?php

namespace App\Http\Controllers;

// ¡AQUÍ 'ESTÁ' 'EL 'ARREGLO'!
// 'Le 'decimos' 'que 'use' 'el 'Controlador' 'de 'verdad' 'de 'Laravel'
// 'y 'lo 'renombramos' 'a 'BaseController' 'pa' 'que 'no 'se 'cruce''
use Illuminate\Routing\Controller as BaseController; 

use App\Models\Ciclo;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

// ¡'Y 'AQUÍ' 'USAMOS' 'EL 'DE 'VERDAD' (EL 'BaseController')!
class CicloController extends BaseController
{
    /**
     * 'Muestra' 'la 'lista'' 'de 'ciclos'.
     */
    public function index(): View
    {
        $ciclos = Ciclo::latest()->get();
        
        return view('ciclos.index', [
            'ciclos' => $ciclos,
        ]);
    }

    /**
     * 'Muestra' 'el 'formulario'' 'para 'crear' 'un 'ciclo' 'nuevo'.
     */
    public function create(): View
    {
        return view('ciclos.create');
    }

    /**
     * 'Guarda' 'el 'ciclo' 'nuevo' 'en 'la 'BD''.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => 'required|string|max:255|unique:ciclos',
        ]);

        Ciclo::create($validated);

        return redirect()->route('ciclos.index');
    }

    /**
     * 'Muestra' 'un 'ciclo'' 'específico'.
     */
    public function show(Ciclo $ciclo)
    {
        // 'Aún' 'no 'lo 'usamos'
    }

    /**
     * 'Muestra' 'el 'formulario'' 'para 'editar' 'un 'ciclo'.
     */
    public function edit(Ciclo $ciclo): View
    {
        return view('ciclos.edit', [
            'ciclo' => $ciclo,
        ]);
    }

    /**
     * 'Actualiza' 'el 'ciclo'' 'en 'la 'BD''.
     */
    public function update(Request $request, Ciclo $ciclo): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('ciclos')->ignore($ciclo->id),
            ],
        ]);

        $ciclo->update($validated);

        return redirect()->route('ciclos.index');
    }

    /**
     * 'Borra' 'el 'ciclo'' 'de 'la 'BD''.
     */
    public function destroy(Ciclo $ciclo): RedirectResponse
    {
        $ciclo->delete();

        return redirect()->route('ciclos.index');
    }
}