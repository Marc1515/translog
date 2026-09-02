import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(
  error: unknown,
  fallback = 'Ha ocurrido un error.',
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  const message = error.error?.message;
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.join('. ');
  }

  return fallback;
}
