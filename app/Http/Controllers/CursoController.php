<?php

namespace App\Http\Controllers;

use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;

class CursoController extends BaseController
{
    /**
     * 'Muestra' 'la 'lista'' 'de 'cursos'.
     */
    public function index(): View
    {
        $cursos = Curso::latest()->get();
        
        return view('cursos.index', [
            'cursos' => $cursos,
        ]);
    }

    /**
     * 'Muestra' 'el 'formulario'' 'para 'crear' 'un 'curso' 'nuevo'.
     */
    public function create(): View
    {
        return view('cursos.create');
    }

    /**
     * ¡'AQUÍ' 'ESTÁ' 'EL 'MÉTODO' 'DE 'GUARDADO''!
     * 'Guarda' 'el 'curso' 'nuevo' 'en 'la 'BD''.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. 'Validamos' 'la 'info' 'que 'llega' 'del 'formulario'.
        $validated = $request->validate([
            'codigo' => 'required|string|max:10|unique:cursos', // 'Código' 'es 'único' 'y 'corto'.
            'nombre_curso' => 'required|string|max:255',
            'creditos' => 'required|integer|min:1|max:12',
        ]);

        // 2. 'Creamos' 'el 'Curso' 'nuevo' 'en 'la 'BD'.
        Curso::create($validated);

        // 3. 'Lo 'mandamos' 'de 'vuelta' 'a 'la 'lista'.
        return redirect()->route('cursos.index');
    }

    public function show(Curso $curso){}
    public function edit(Curso $curso): View{}
    public function update(Request $request, Curso $curso): RedirectResponse{}
    public function destroy(Curso $curso): RedirectResponse{}
}