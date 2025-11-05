<x-layouts.app>

    <x-slot:title>
        Gestionar Ciclos
    </x-slot:title>

    {{-- 'Cabecera' 'con 'Título' 'y 'Botón' 'de 'Crear'' --}}
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900">
            Gestionar Ciclos Académicos
        </h2>
        
        <a href="{{ route('ciclos.create') }}" 
           class="quick-link-card p-3 text-center items-center flex justify-center
                  border-2 border-dashed border-gray-300 hover:border-indigo-500">
            
            <div class="p-2 rounded-full bg-indigo-100 text-indigo-600 inline-block">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <span class="ml-3 text-lg font-semibold text-gray-800">Crear Ciclo Nuevo</span>
        </a>
    </div>

    {{-- 'La 'Tabla' 'piticlin', 'estilo' 'pasajes24-7' --}}
    <div class="shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <table class="min-w-full bg-white divide-y divide-gray-200">
            {{-- 'Cabecera' 'de 'la 'tabla'' --}}
            <thead class="bg-slate-50">
                <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre del Ciclo
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cursos Registrados
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                        <span class="sr-only">Acciones</span>
                    </th>
                </tr>
            </thead>
            {{-- 'Cuerpo' 'de 'la 'tabla'' --}}
            <tbody class="divide-y divide-gray-200">
                
                @forelse ($ciclos as $ciclo)
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {{ $ciclo->id }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">
                            {{ $ciclo->nombre }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {{ $ciclo->cursos()->count() }} cursos
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium
                                   flex justify-end items-center space-x-4">
                            
                            {{-- 1. 'Botón' 'EDITAR' --}}
                            <a href="{{ route('ciclos.edit', $ciclo) }}" class="text-indigo-600 hover:text-indigo-900">
                                Editar
                            </a>

                            {{-- 2. 'Botón' 'ELIMINAR' --}}
                            <form action="{{ route('ciclos.destroy', $ciclo) }}" method="POST"
                                  onsubmit="return confirm('¿'Estás' 'seguro' 'de 'que 'quieres' 'volar' 'este' 'ciclo'? 'No 'hay' 'vuelta' 'atrás'.');">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="text-red-600 hover:text-red-900">
                                    Eliminar
                                </button>
                            </form>
                        </td>
                    </tr>
                @empty
                    {{-- 'Esto' 'se 'muestra'' 'si 'la 'tabla'' 'está 'misia'' --}}
                    <tr>
                        <td colspan="4" class="px-6 py-12 text-center">
                            <div class="flex flex-col items-center">
                                <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002 2V7m-4 10V7m-4 10V7m-4 10V7M4 7h16"></path></svg>
                                <h3 class="mt-2 text-lg font-semibold text-gray-800">No hay ciclos registrados</h3>
                                <p class="mt-1 text-sm text-gray-500">Empieza creando uno nuevo con el botón de arriba.</p>
                            </div>
                        </td>
                    </tr>
                @endforelse {{-- <-- ¡AQUÍ 'ESTABA' 'EL 'ROCHE'! (Decía @empty) --}}
                
            </tbody>
        </table>
    </div>
</x-layouts.app>