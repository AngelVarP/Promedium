<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CicloController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CursoController;


// (2) ¡LA 'NUEVA' (NUEVA) 'RUTA 'PRINCIPAL'' (RUTA PRINCIPAL)!
// Apunta al Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

Route::resource('/ciclos', CicloController::class);

Route::resource('/cursos', CursoController::class);