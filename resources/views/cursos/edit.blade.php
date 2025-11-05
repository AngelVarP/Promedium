<x-layouts.app>

    <x-slot:title>
        Editar Curso
    </x-slot:title>

    {{-- 'Cabecera' 'con 'Título' 'y 'Botón' 'de 'Regresar'' --}}
    <div class="flex justify-between items-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900">
            Editar Curso: {{ $curso->nombre_curso }}
        </h2>
        
        <a href="{{ route('cursos.index') }}" 
           class="quick-link-card p-3 text-center items-center flex justify-center
                  border-2 border-dashed border-gray-300 hover:border-gray-400">
            
            <div class="p-2 rounded-full bg-gray-100 text-gray-600 inline-block">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
            </div>
            <span class="ml-3 text-lg font-semibold text-gray-800">Volver al Catálogo</span>
        </a>
    </div>

    {{-- 'La 'tarjeta' 'blanca' 'piticlin'' --}}
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        
        {{-- ¡'OJO' 'A 'ESTO'! 'APUNTA' 'A `cursos.update`' 'Y 'USA' 'MÉTODO' 'PUT'. --}}
        <form action="{{ route('cursos.update', $curso) }}" method="POST">
            @csrf
            @method('PUT') {{-- 'Obligatorio' 'pa' 'el 'método' 'UPDATE' --}}

            {{-- 'Grilla' 'de 'dos' 'columnas' --}}
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

                {{-- Columna 1: Código --}}
                <div class="md:col-span-1">
                    <label for="codigo" class="block text-sm font-medium text-gray-700 mb-2">
                        Código
                    </label>
                    <input type="text" 
                           name="codigo" 
                           id="codigo"
                           value="{{ old('codigo', $curso->codigo) }}" {{-- 'MUESTRA' 'EL 'VALOR' 'VIEJO' --}}
                           placeholder="Ej: MAT101"
                           required
                           class="block w-full px-4 py-3 text-sm
                                  border-gray-300 rounded-lg shadow-sm 
                                  focus:ring-indigo-500 focus:border-indigo-500 @error('codigo') border-red-500 focus:border-red-500 focus:ring-red-500 @enderror">
                    @error('codigo')
                        <div class="flex items-center mt-2 text-red-600 text-sm"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><span>{{ $message }}</span></div>
                    @enderror
                </div>
                
                {{-- Columna 2: Nombre --}}
                <div class="md:col-span-2">
                    <label for="nombre_curso" class="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Curso
                    </label>
                    <input type="text" 
                           name="nombre_curso" 
                           id="nombre_curso"
                           value="{{ old('nombre_curso', $curso->nombre_curso) }}"
                           placeholder="Ej: Cálculo I"
                           required
                           class="block w-full px-4 py-3 text-sm
                                  border-gray-300 rounded-lg shadow-sm 
                                  focus:ring-indigo-500 focus:border-indigo-500 @error('nombre_curso') border-red-500 focus:border-red-500 focus:ring-red-500 @enderror">
                    @error('nombre_curso')
                        <div class="flex items-center mt-2 text-red-600 text-sm"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><span>{{ $message }}</span></div>
                    @enderror
                </div>
            </div>

            {{-- Fila de Créditos --}}
            <div class="mt-6 max-w-xs">
                <label for="creditos" class="block text-sm font-medium text-gray-700 mb-2">
                    Créditos
                </label>
                <input type="number" 
                       name="creditos" 
                       id="creditos"
                       value="{{ old('creditos', $curso->creditos) }}"
                       placeholder="Ej: 4"
                       min="1"
                       max="12"
                       required
                       class="block w-full px-4 py-3 text-sm
                              border-gray-300 rounded-lg shadow-sm 
                              focus:ring-indigo-500 focus:border-indigo-500 @error('creditos') border-red-500 focus:border-red-500 focus:ring-red-500 @enderror">
                @error('creditos')
                    <div class="flex items-center mt-2 text-red-600 text-sm"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg><span>{{ $message }}</span></div>
                @enderror
            </div>


            {{-- Botones de acción --}}
            <div class="flex justify-end space-x-4 mt-8">
                
                {{-- Botón Cancelar --}}
                <a href="{{ route('cursos.index') }}"
                   class="font-bold py-3 px-6 rounded-lg 
                          bg-transparent border-2 border-red-500 text-red-500 
                          hover:bg-red-50 hover:text-red-600
                          transition duration-300 ease-in-out">
                    Cancelar
                </a>

                {{-- ¡Cambiamos' 'el 'texto'! --}}
                <button type="submit" 
                        class="font-bold py-3 px-6 rounded-lg 
                               bg-transparent border-2 border-green-600 text-green-600 
                               hover:bg-green-50 hover:text-green-700
                               transition duration-300 ease-in-out">
                    Actualizar Curso
                </button>
            </div>

        </form>
    </div>
</x-layouts.app>