import { Routes } from '@angular/router';

export const TRACKING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/tracking-page/tracking-page').then((m) => m.TrackingPage),
  },
];
