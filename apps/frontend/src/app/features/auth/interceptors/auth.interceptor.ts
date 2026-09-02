import { HttpInterceptorFn } from '@angular/common/http';
import { API_URL } from '../../../core/config/api.config';
import { readStoredAccessToken } from '../utils/auth-storage.util';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) {
    return next(req);
  }

  if (req.url.includes('/auth/login') || req.url.includes('/tracking')) {
    return next(req);
  }

  const token = readStoredAccessToken();
  if (!token) {
    return next(req);
  }

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};
