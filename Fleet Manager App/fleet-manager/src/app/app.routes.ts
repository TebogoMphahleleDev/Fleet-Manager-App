import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./app').then(m => m.App), canActivate: [AuthGuard] }, // Placeholder
  { path: 'vehicles', loadComponent: () => import('./vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent), canActivate: [AuthGuard] },
  { path: 'vehicles/form', loadComponent: () => import('./vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent), canActivate: [AuthGuard] },
  { path: 'vehicles/form/:id', loadComponent: () => import('./vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent), canActivate: [AuthGuard] },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }

];
