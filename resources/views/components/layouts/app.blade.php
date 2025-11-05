<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'Dashboard' }} - Promedium</title>

    {{-- Fuentes de Google --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css', 'resources/js/app.js'])

    {{-- =============================================== --}}
    {{-- Custom styles inspired by Pasajes24-7 --}}
    {{-- =============================================== --}}
    <style>
        body { 
            font-family: 'Inter', sans-serif; 
            background-color: #ffffff;
        }
        .admin-sidebar { 
            background-color: #f1f5f9; /* bg-slate-100 */
            border-right: 1px solid #e5e7eb; /* border-r border-gray-200 */
        }
        .admin-sidebar a { 
            color: #4b5563; /* text-gray-600 */
            transition: all 0.2s ease-in-out;
        }
        .admin-sidebar a:hover { 
            background-color: #ffffff; /* bg-white */
            color: #111827; /* text-gray-900 */
            transform: translateX(4px); /* ¡ESTA ES LA 'NUEVA' (NUEVA) 'LÍNEA' (LÍNEA)! */
        }
        .admin-sidebar a.active { 
            color: #4f46e5; /* Indigo accent color */
            background-color: #ffffff; /* bg-white */
            border-left: 4px solid #4f46e5; /* Indigo border */
            padding-left: calc(1rem - 4px); 
            font-weight: 600;
        }
        .header-title {
             color: #111827; /* text-gray-900 */
             font-weight: 700;
        }
        .quick-link-card {
            background-color: #ffffff;
            border: 1px solid #e5e7eb; /* border-gray-200 */
            transition: all 0.2s ease-out;
            border-radius: 0.75rem; /* rounded-xl */
        }
        .quick-link-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 15px rgba(30, 41, 59, 0.07);
            border-color: #6366f1; /* Indigo border on hover */
        }
    </style>
</head>
<body class="bg-white text-gray-900" x-data>

    <div class="flex min-h-screen">
        
        {{-- Sidebar menu --}}
        <aside class="admin-sidebar fixed top-0 left-0 z-50 w-64 h-screen pt-5
                    md:translate-x-0 -translate-x-full transition-transform duration-300">
            <div class="flex flex-col h-full">
                <div class="px-5 mb-6">
                    <h1 class="text-2xl font-bold text-indigo-600">
                        Promedium
                    </h1>
                </div>
                
                {{-- Line 55 (corrected) --}}
                <nav class="grow px-4 space-y-2">
                    
                    {{-- (1) Link al Dashboard --}}
                    {{-- 'request()->routeIs('dashboard')' 'pregunta' (asks): "¿'Estamos' (Are we) 'en 'la 'ruta'' (in the route) 'dashboard'?" --}}
                    <a href="{{ route('dashboard') }}" 
                       class="flex items-center space-x-3 px-5 py-3 rounded-lg 
                              {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6-4a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z"></path></svg>
                        <span>Dashboard</span>
                    </a>

                    {{-- (2) Link a Ciclos --}}
                    <a href="{{ route('ciclos.index') }}" 
                       class="flex items-center space-x-3 px-5 py-3 rounded-lg
                              {{ request()->routeIs('ciclos.index') ? 'active' : '' }}">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        <span>Gestionar Ciclos</span>
                    </a>
                </nav>
            </div>
        </aside>

        {{-- 'CONTENIDO' (CONTENIDO) 'PRINCIPAL' (PRINCIPAL) --}}
        <div class="flex-1 flex flex-col md:ml-64">

            {{-- Header Superior --}}
            <header class="bg-white shadow-sm h-16 flex items-center justify-between px-6 border-b border-gray-200 sticky top-0 z-40">
                <div class="flex items-center">
                    <h1 class="header-title text-xl">
                        {{ $title ?? 'Dashboard' }}
                    </h1>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600">Hola, Angelito</span>
                </div>
            </header>

            {{-- Line 83 (corrected) --}}
            <main class="grow p-6 lg:p-10 bg-white"> {{-- <-- 'grow' --}}
                {{ $slot }}
            </main>
        </div>
    </div>
</body>
</html>
