<x-layouts.app>

    {{-- (1) El titulo principal --}}
    <x-slot:title>
        Dashboard de Ciclos
    </x-slot:title>

    {{-- (2) Bienvenida --}}
    <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900">
            Bienvenido, Causa!
        </h2>
        <p class="text-gray-500 mt-2">Gestiona tus ciclos academicos desde aqui.</p>
    </div>

    {{-- (3) Grilla de Accesos Rapidos --}}
    <h3 class="text-xl font-semibold text-gray-800 mb-6">Mis Ciclos</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {{-- Boton de crear --}}
        <a href="#" 
           class="quick-link-card p-6 text-center items-center flex flex-col justify-center
                  border-2 border-dashed border-gray-300 hover:border-indigo-500">
            
            <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-3 inline-block">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </div>
            <h2 class="text-lg font-semibold text-gray-800">Registrar Ciclo</h2>
            <p class="text-gray-500 text-sm">Empezar un nuevo ciclo.</p>
        </a>

        
        {{-- (4) Los ciclos de la BD --}}
        @forelse ($ciclos as $ciclo)
            <a href="#" class="quick-link-card p-6 text-center items-center flex flex-col">
                <div class="p-4 rounded-full bg-blue-100 text-blue-600 mb-4 inline-block">
                    <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.906 59.906 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.717 50.717 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                    </svg>
                </div>
                <h2 class="text-lg font-semibold text-gray-800 mb-1">{{ $ciclo->nombre }}</h2>
                <p class="text-gray-500 text-sm">Promedio: --.--</p>
            </a>
        @empty
            {{-- Si no hay ciclos solo se muestra el boton de crear --}}
        @endforelse {{-- Aqui estaba el error: decia @empty --}}

    </div>

</x-layouts.app>
