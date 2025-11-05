<x-layouts.app>

    <x-slot:title>
        Registrar Nuevo Ciclo
    </x-slot:title>

    {{-- 'Cabecera' 'con 'Título' 'y 'Botón' 'de 'Regresar'' --}}
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900">
            Registrar Nuevo Ciclo
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

    
    {{-- 'La 'tarjeta' 'blanca' 'piticlin'' --}}
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        
        <form action="{{ route('ciclos.store') }}" method="POST" class="flex items-end justify-between gap-6">
            @csrf

            {{-- 'ITEM' 1: 'EL 'FORMULARIO' (QUE 'CRECE') --}}
            <div class="grow">
                <label for="nombre" class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Ciclo
                </label>
                
                <input type="text" 
                       name="nombre" 
                       id="nombre"
                       placeholder="Ej: 2025-1"
                       required
                       {{-- 
                         ¡'AQUÍ' 'ESTÁ' 'LA 'MAGIA' (1/2)!
                         'Si 'hay' 'un 'error' 'en 'nombre', 'le 'metemos' 'clases' 'rojas'.
                       --}}
                       class="block w-full px-4 py-3 text-sm
                              border-gray-300 rounded-lg shadow-sm 
                              focus:ring-indigo-500 focus:border-indigo-500
                              @error('nombre') border-red-500 focus:border-red-500 focus:ring-red-500 @enderror">

                {{-- 
                  ¡'AQUÍ' 'ESTÁ' 'LA 'MAGIA' (2/2)!
                  'Este 'bloque' 'solo 'aparece' 'si 'hay' 'un 'error' 'en 'nombre'.
                --}}
                @error('nombre')
                    <div class="flex items-center mt-2 text-red-600 text-sm">
                        {{-- 'El 'ícono' 'piticlin' --}}
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        {{-- 'Y 'el 'mensaje' 'que 'manda' 'el 'controller' ('Ej: El 'nombre' 'ya 'existe') --}}
                        <span>{{ $message }}</span>
                    </div>
                @enderror
            </div>

            {{-- 'ITEM' 2: 'LOS 'BOTONES' (NO 'CRECEN') --}}
            <div class="flex-shrink-0 flex space-x-4">
                
                {{-- 'Botón' 'Cancelar' (Contorno 'Rojo') --}}
                <a href="{{ route('ciclos.index') }}"
                   class="font-bold py-3 px-6 rounded-lg 
                          bg-transparent border-2 border-red-500 text-red-500 
                          hover:bg-red-50 hover:text-red-600
                          transition duration-300 ease-in-out">
                    Cancelar
                </a>

                {{-- 'Botón' 'Guardar' (Contorno 'Verde') --}}
                <button type="submit" 
                        class="font-bold py-3 px-6 rounded-lg 
                               bg-transparent border-2 border-green-600 text-green-600 
                               hover:bg-green-50 hover:text-green-700
                               transition duration-300 ease-in-out">
                    Guardar Ciclo
                </button>
            </div>

        </form>
    </div>

</x-layouts.app>