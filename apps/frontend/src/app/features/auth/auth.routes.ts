import { Routes } from '@angular/router';
import { supervisorGuard } from './guards/supervisor.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canMatch: [supervisorGuard],
    loadComponent: () =>
      import('./pages/register-page/register-page').then(
        (m) => m.RegisterPage,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
