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
     * 'Guarda' 'el 'curso' 'nuevo' 'en 'la 'BD''.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'codigo' => 'required|string|max:10|unique:cursos',
            'nombre_curso' => 'required|string|max:255',
            'creditos' => 'required|integer|min:1|max:12',
        ]);

        Curso::create($validated);

        return redirect()->route('cursos.index');
    }

    /**
     * 'Muestra' 'el 'formulario'' 'para 'editar' 'un 'curso'.
     */
    public function edit(Curso $curso): View
    {
        return view('cursos.edit', [
            'curso' => $curso,
        ]);
    }

    /**
     * ¡'MÉTODO' 'DE 'ACTUALIZACIÓN'!
     * 'Actualiza' 'el 'curso' 'en 'la 'BD''.
     */
    public function update(Request $request, Curso $curso): RedirectResponse
    {
        // 1. 'Validamos' 'la 'info'.
        $validated = $request->validate([
            // 'El 'código' 'es 'único', 'pero 'ignoramos' 'el 'ID' 'del 'curso' 'actual'.
            'codigo' => [
                'required',
                'string',
                'max:10',
                Rule::unique('cursos')->ignore($curso->id),
            ],
            'nombre_curso' => 'required|string|max:255',
            'creditos' => 'required|integer|min:1|max:12',
        ]);

        // 2. 'Actualizamos' 'y 'guardamos'.
        $curso->update($validated);

        // 3. 'Redireccionamos'.
        return redirect()->route('cursos.index');
    }

    /**
     * 'Borra' 'el 'curso' 'de 'la 'BD''.
     */
    public function destroy(Curso $curso): RedirectResponse
    {
        // 'Lo 'borramos' 'de 'la 'BD'.
        $curso->delete();

        // 'Redireccionamos'.
        return redirect()->route('cursos.index');
    }
    
    // 'El 'show' 'queda' 'vacío' 'porque 'no 'lo 'usamos'.
    public function show(Curso $curso){}
}