import { Routes } from '@angular/router';
import { authGuard } from './features/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'shipments',
    canMatch: [authGuard],
    loadChildren: () =>
      import('./features/shipments/shipments.routes').then(
        (m) => m.SHIPMENTS_ROUTES,
      ),
  },
  {
    path: 'tracking',
    loadChildren: () =>
      import('./features/tracking/tracking.routes').then(
        (m) => m.TRACKING_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
