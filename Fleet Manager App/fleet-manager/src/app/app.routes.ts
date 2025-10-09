 import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'vehicles', loadComponent: () => import('./vehicles/vehicle-list/vehicle-list.component').then(m => m.VehicleListComponent), canActivate: [AuthGuard] },
  { path: 'vehicles/form', loadComponent: () => import('./vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent), canActivate: [AuthGuard] },
  { path: 'vehicles/form/:id', loadComponent: () => import('./vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent), canActivate: [AuthGuard] },
  { path: 'drivers', loadComponent: () => import('./drivers/driver-list/driver-list.component').then(m => m.DriverListComponent), canActivate: [AuthGuard] },
  { path: 'drivers/form', loadComponent: () => import('./drivers/driver-form/driver-form.component').then(m => m.DriverFormComponent), canActivate: [AuthGuard] },
  { path: 'drivers/form/:id', loadComponent: () => import('./drivers/driver-form/driver-form.component').then(m => m.DriverFormComponent), canActivate: [AuthGuard] },
  { path: 'trips', loadComponent: () => import('./trips/trip-list/trip-list.component').then(m => m.TripListComponent), canActivate: [AuthGuard] },
  { path: 'trips/form', loadComponent: () => import('./trips/trip-form/trip-form.component').then(m => m.TripFormComponent), canActivate: [AuthGuard] },
  { path: 'trips/form/:id', loadComponent: () => import('./trips/trip-form/trip-form.component').then(m => m.TripFormComponent), canActivate: [AuthGuard] },
  { path: 'trips/:id', loadComponent: () => import('./trips/trip-detail/trip-detail.component').then(m => m.TripDetailComponent), canActivate: [AuthGuard] },
  { path: 'maintenance', loadComponent: () => import('./maintenance/maintenance-list/maintenance-list.component').then(m => m.MaintenanceListComponent), canActivate: [AuthGuard] },
  { path: 'maintenance/form', loadComponent: () => import('./maintenance/maintenance-form/maintenance-form.component').then(m => m.MaintenanceFormComponent), canActivate: [AuthGuard] },
  { path: 'maintenance/form/:id', loadComponent: () => import('./maintenance/maintenance-form/maintenance-form.component').then(m => m.MaintenanceFormComponent), canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' }
];
