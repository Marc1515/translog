import { Routes } from '@angular/router';

export const SHIPMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../core/layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/shipments-page/shipments-page').then(
            (m) => m.ShipmentsPage,
          ),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/shipment-new-page/shipment-new-page').then(
            (m) => m.ShipmentNewPage,
          ),
      },
      {
        path: 'assign-vehicles',
        loadComponent: () =>
          import('./pages/vehicle-assignment-page/vehicle-assignment-page').then(
            (m) => m.VehicleAssignmentPage,
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./pages/shipment-detail-page/shipment-detail-page').then(
            (m) => m.ShipmentDetailPage,
          ),
      },
    ],
  },
];
