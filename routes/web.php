<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CicloController;
use App\Http\Controllers\DashboardController;


// (2) ¡LA 'NUEVA' (NUEVA) 'RUTA 'PRINCIPAL'' (RUTA PRINCIPAL)!
// Apunta al Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

// (3) ¡LA 'RUTA 'DE 'CICLOS''' (RUTA DE CICLOS) 'AHORA 'VIVE' (AHORA VIVE) 'EN '/ciclos' (EN '/ciclos')!
Route::get('/ciclos', [CicloController::class, 'index'])->name('ciclos.index');