<x-layouts.app>

    <x-slot:title>
        Gestionar Cursos
    </x-slot:title>

    {{-- 'Cabecera' 'con 'Título' 'y 'Botón' 'de 'Crear'' --}}
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900">
            Catálogo de Cursos
        </h2>
        
        <a href="{{ route('cursos.create') }}" 
           class="quick-link-card p-3 text-center items-center flex justify-center
                  border-2 border-dashed border-gray-300 hover:border-indigo-500">
            
            <div class="p-2 rounded-full bg-indigo-100 text-indigo-600 inline-block">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <span class="ml-3 text-lg font-semibold text-gray-800">Registrar Curso Nuevo</span>
        </a>
    </div>

    {{-- 'La 'Tabla' 'piticlin', 'estilo' 'pasajes24-7' --}}
    <div class="shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table class="min-w-full bg-white divide-y divide-gray-200">
            {{-- 'Cabecera' 'de 'la 'tabla'' --}}
            <thead class="bg-slate-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre del Curso
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Créditos
                    </th>
                    {{-- ¡CAMBIO DE COLUMNA! --}}
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nota Máxima Obtenida
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Acciones</span>
                    </th>
                </tr>
            </thead>
            {{-- 'Cuerpo' 'de 'la 'tabla'' --}}
            <tbody class="divide-y divide-gray-200">
                
                @forelse ($cursos as $curso)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                            {{ $curso->codigo }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                            {{ $curso->nombre_curso }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $curso->creditos }}
                        </td>
                        
                        {{-- ¡AQUÍ VIENE LA LÓGICA DE LA NOTA! --}}
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            {{-- 
                              ¡OJO! 'ESTA 'LÓGICA' 'AÚN' 'NO 'ESTÁ' 'PROGRAMADA' 'EN 'EL 'MODELO''!
                              'ES' 'UN 'PLACEHOLDER' 'PA' 'SABER' 'CÓMO' 'DEBERÍA' 'VERSE'.
                              'ASUMIMOS' 'QUE 'EL 'MODELO' 'TENDRÁ' 'UN 'MÉTODO' `notaMaxima()`.
                            --}}
                            @php
                                // 'Por 'ahora', 'usamos' 'un 'dato' 'falso'.
                                $notaMaxima = null; // null 'simula' "En Proceso"
                                // $notaMaxima = 15.5; // 'Descomenta' 'pa' 'probar' 'nota'
                            @endphp

                            @if (is_numeric($notaMaxima))
                                {{-- 'Si 'la 'nota' 'existe', 'la 'muestra' 'con 'color' 'de 'aprobado'' 'o 'jalado'. --}}
                                <span class="font-bold {{ $notaMaxima >= 10.5 ? 'text-green-600' : 'text-red-600' }}">
                                    {{ number_format($notaMaxima, 1) }}
                                </span>
                            @else
                                {{-- 'Si 'no 'hay' 'nota' (null), 'muestra' "En Proceso". --}}
                                <span class="text-yellow-600 font-semibold bg-yellow-100 px-3 py-1 rounded-full text-xs">
                                    En Catálogo
                                </span>
                            @endif
                        </td>

                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium
                                   flex justify-end items-center space-x-4">
                            
                            <a href="#" class="text-indigo-600 hover:text-indigo-900">
                                Editar
                            </a>

                            <form action="#" method="POST" onsubmit="return confirm('¿Estás seguro de que quieres volar este curso?');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">
                                    Eliminar
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" class="px-6 py-12 text-center">
                            <div class="flex flex-col items-center">
                                <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-4 10V7m-4 10V7m-4 10V7M4 7h16"></path></svg>
                                <h3 class="mt-2 text-lg font-semibold text-gray-800">No hay cursos en el catálogo</h3>
                                <p class="mt-1 text-sm text-gray-500">Crea el primer curso que vas a registrar en un ciclo.</p>
                            </div>
                        </td>
                    </tr>
                @endforelse
                
            </tbody>
        </table>
    </div>
</x-layouts.app>