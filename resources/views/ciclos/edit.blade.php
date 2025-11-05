<x-layouts.app>

    <x-slot:title>
        Editar Ciclo
    </x-slot:title>

    {{-- 'Cabecera' 'con 'Título' 'y 'Botón' 'de 'Regresar'' --}}
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900">
            Editar Ciclo: {{ $ciclo->nombre }}
        </h2>
        
        <a href="{{ route('ciclos.index') }}" 
           class="quick-link-card p-3 text-center items-center flex justify-center
                  border-2 border-dashed border-gray-300 hover:border-gray-400">
            
            <div class="p-2 rounded-full bg-gray-100 text-gray-600 inline-block">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            </div>
            <span class="ml-3 text-lg font-semibold text-gray-800">Volver a la Lista</span>
        </a>
    </div>

    
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        
        {{-- =============================================== --}}
        {{-- ¡'OJO' 'A 'LOS 'CAMBIOS'! --}}
        {{-- =============================================== --}}

        {{-- 1. 'El 'action' 'apunta' 'a `ciclos.update` 'y 'le 'pasa' 'el 'ID' 'del 'ciclo'. --}}
        <form action="{{ route('ciclos.update', $ciclo) }}" method="POST" class="flex items-end justify-between gap-6">
            @csrf
            {{-- 2. 'Le 'decimos' 'a 'Laravel' 'que 'esto' 'es 'un 'UPDATE', 'no 'un 'POST' 'normal'. --}}
            @method('PUT')

            {{-- 'ITEM' 1: 'EL 'FORMULARIO' --}}
            <div class="grow">
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Ciclo
                </label>
                
                {{-- 3. 'El 'input' 'ahora' 'tiene' 'un `value`' 'pa' 'mostrar' 'el 'dato' 'viejo'. --}}
                <input type="text" 
                       name="nombre" 
                       id="nombre"
                       value="{{ $ciclo->nombre }}"
                       required
                       class="block w-full px-4 py-3 text-sm
                              border-gray-300 rounded-lg shadow-sm 
                              focus:ring-indigo-500 focus:border-indigo-500">
            </div>

            {{-- 'ITEM' 2: 'LOS 'BOTONES' --}}
            <div class="flex-shrink-0 flex space-x-4">
                
                <a href="{{ route('ciclos.index') }}"
                   class="font-bold py-3 px-6 rounded-lg 
                          bg-transparent border-2 border-red-500 text-red-500 
                          hover:bg-red-50 hover:text-red-600
                          transition duration-300 ease-in-out">
                    Cancelar
                </a>

                {{-- 4. 'Cambiamos' 'el 'texto' 'del 'botón'. --}}
                <button type="submit" 
                        class="font-bold py-3 px-6 rounded-lg 
                               bg-transparent border-2 border-green-600 text-green-600 
                               hover:bg-green-50 hover:text-green-700
                               transition duration-300 ease-in-out">
                    Actualizar Cambios
                </button>
            </div>

        </form>
    </div>

</x-layouts.app>