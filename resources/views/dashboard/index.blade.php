<x-layouts.app>

    <x-slot:title>
        Dashboard
    </x-slot:title>

    {{-- =============================================== --}}
    {{-- (1) ¡'MEJORA' (MEJORA) 'DE 'TIPOGRAFÍA'' (DE TIPOGRAFÍA)! --}}
    {{-- =============================================== --}}
    <div class="mb-8">
        {{-- 'Cambiamos' (Cambiamos) 'a 'text-4xl font-light'' (a 'text-4xl font-light') --}}
        <h2 class="text-4xl font-light text-gray-800">
            ¡Bienvenido de vuelta, Angel!
        </h2>
        <p class="text-gray-500 mt-2">Aquí tienes tu resumen al toque.</p>
    </div>

    {{-- =============================================== --}}
    {{-- (2) ¡'MEJORA' (MEJORA) 'DE 'ANIMACIÓN'' (DE ANIMACIÓN)! --}}
    {{-- =============================================== --}}
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        
        {{-- 'Envolvemos' (Envolvemos) 'cada' (cada) 'tarjeta' (tarjeta) 'en 'un 'div'' (en un 'div') 'con 'Alpine' (Alpine) 'pa' (para) 'animarla' (animarla) --}}

        {{-- Tarjeta 1 (Delay 0ms) --}}
        <div x-data="{ show: false }" x-init="$nextTick(() => show = true)" 
             x-show="show" 
             x-transition:enter="transition ease-out duration-500 transform"
             x-transition:enter-start="opacity-0 translate-y-10"
             x-transition:enter-end="opacity-100 translate-y-0"
             style="transition-delay: 0ms">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-indigo-500 transition duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-full">
                <div class="flex justify-between items-start mb-2">
                    <p class="text-sm text-gray-500 font-medium uppercase tracking-wider">Promedio Ponderado</p>
                    <span class="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.4-1.683 3.016M4.5 20.5-2.293 17.707a1 1 0 0 1-.293-1.414L2.293 12.5l2.293 2.293L12 21.56l7.707-7.707 2.293-2.293-.293.293a1 1 0 0 1-1.414-.293L20.5 4.5 17.707 2.293a1 1 0 0 1-1.414-.293L12.5 2.293 10.207 4.5 4.5 10.207l-2.293 2.293a1 1 0 0 1-.293 1.414L4.5 20.5Z" /></svg></span>
                </div>
                <p class="text-4xl font-bold text-gray-900 mt-2">--.--</p>
            </div>
        </div>

        {{-- Tarjeta 2 (Delay 100ms) --}}
        <div x-data="{ show: false }" x-init="$nextTick(() => show = true)" 
             x-show="show" 
             x-transition:enter="transition ease-out duration-500 transform"
             x-transition:enter-start="opacity-0 translate-y-10"
             x-transition:enter-end="opacity-100 translate-y-0"
             style="transition-delay: 100ms">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-green-500 transition duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-full">
                <div class="flex justify-between items-start mb-2">
                    <p class="text-sm text-gray-500 font-medium uppercase tracking-wider">Créditos Aprobados</p>
                    <span class="bg-green-100 text-green-600 p-2 rounded-lg"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg></span>
                </div>
                <p class="text-4xl font-bold text-gray-900 mt-2">0</p>
            </div>
        </div>

        {{-- Tarjeta 3 (Delay 200ms) --}}
        <div x-data="{ show: false }" x-init="$nextTick(() => show = true)" 
             x-show="show" 
             x-transition:enter="transition ease-out duration-500 transform"
             x-transition:enter-start="opacity-0 translate-y-10"
             x-transition:enter-end="opacity-100 translate-y-0"
             style="transition-delay: 200ms">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-orange-400 transition duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-full">
                <div class="flex justify-between items-start mb-2">
                    <p class="text-sm text-gray-500 font-medium uppercase tracking-wider">Cursos en Progreso</p>
                    <span class="bg-orange-100 text-orange-600 p-2 rounded-lg"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-1.334v-4.992m0 0h-4.992m4.992 0-3.181-3.183a8.25 8.25 0 0 0-11.667 0L2.985 7.666m4.991 1.334 3.181 3.183m0 0A12.001 12.001 0 0 0 12 19.5a12.001 12.001 0 0 0 1.902-3.183m-1.902 3.183h-4.992" /></svg></span>
                </div>
                <p class="text-4xl font-bold text-gray-900 mt-2">0</p>
            </div>
        </div>

        {{-- Tarjeta 4 (Delay 300ms) --}}
        <div x-data="{ show: false }" x-init="$nextTick(() => show = true)" 
             x-show="show" 
             x-transition:enter="transition ease-out duration-500 transform"
             x-transition:enter-start="opacity-0 translate-y-10"
             x-transition:enter-end="opacity-100 translate-y-0"
             style="transition-delay: 300ms">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500 transition duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 h-full">
                <div class="flex justify-between items-start mb-2">
                    <p class="text-sm text-gray-500 font-medium uppercase tracking-wider">Ciclos Registrados</p>
                    <span class="bg-blue-100 text-blue-600 p-2 rounded-lg"><svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg></span>
                </div>
                <p class="text-4xl font-bold text-gray-900 mt-2">0</p>
            </div>
        </div>
    </div>

    {{-- =============================================== --}}
    {{-- Cursos del Ciclo (¡'También' (También) 'con 'animación'' (con animación)!) --}}
    {{-- =============================================== --}}

    @if ($cicloActual)
        
        <h3 class="text-xl font-semibold text-gray-800 mb-6">
            Cursos del Ciclo: {{ $cicloActual->nombre }}
        </h3>
        
        {{-- 'Le 'metemos' (Le ponemos) 'la 'animación'' (la animación) 'al 'padre' (al padre) 'de 'la 'grilla'' (de la grilla) --}}
        <div x-data="{ show: false }" x-init="$nextTick(() => show = true)"
             x-show="show" 
             x-transition:enter="transition ease-out duration-500 transform"
             x-transition:enter-start="opacity-0 translate-y-10"
             x-transition:enter-end="opacity-100 translate-y-0"
             style="transition-delay: 400ms" {{-- 'Este 'bloque'' (Este bloque) 'entra' (entra) 'después' (después) 'de 'las 'tarjetas'' (de las tarjetas) --}}
             class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            @forelse ($cursosActuales as $curso)
                <a href="#" class="quick-link-card p-6 text-center items-center flex flex-col">
                    <div class="p-4 rounded-full bg-blue-100 text-blue-600 mb-4 inline-block">
                        <svg class="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.906 59.906 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.717 50.717 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                        </svg>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-800 mb-1">{{ $curso->nombre_curso }}</h2>
                    <p class="text-gray-500 text-sm">Promedio: --.--</p>
                </a>
            @empty
                <a href="#" class="quick-link-card p-6 text-center items-center flex flex-col justify-center
                                  border-2 border-dashed border-gray-300 hover:border-green-500">
                    <div class="p-3 rounded-full bg-green-100 text-green-600 mb-3 inline-block">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-800">Registrar Curso</h2>
                    <p class="text-gray-500 text-sm">Este ciclo aún no tiene cursos.</p>
                </a>
            @endforelse
        </div>

    @else
        {{-- 'Bloque' (Bloque) 'de 'Empecemos'' (de 'Empecemos') ('también' (también) 'animado' (animado)) --}}
        <div x-data="{ show: false }" x-init="$nextTick(() => show = true)"
             x-show="show" 
             x-transition:enter="transition ease-out duration-500 transform"
             x-transition:enter-start="opacity-0 translate-y-10"
             x-transition:enter-end="opacity-100 translate-y-0"
             style="transition-delay: 100ms">

            <h3 class="text-xl font-semibold text-gray-800 mb-6">¡Empecemos!</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <a href="{{ route('ciclos.index') }}" 
                   class="quick-link-card p-6 text-center items-center flex flex-col justify-center
                          border-2 border-dashed border-gray-300 hover:border-indigo-500">
                    <div class="p-3 rounded-full bg-indigo-100 text-indigo-600 mb-3 inline-block">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    </div>
                    <h2 class="text-lg font-semibold text-gray-800">Registra tu Primer Ciclo</h2>
                    <p class="text-gray-500 text-sm">Para empezar a añadir cursos.</p>
                </a>
            </div>
        </div>
    @endif

</x-layouts.app>