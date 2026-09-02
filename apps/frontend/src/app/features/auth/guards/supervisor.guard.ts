import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const supervisorGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.hasRole('SUPERVISOR')) {
    return true;
  }

  return router.createUrlTree(['/shipments']);
};
