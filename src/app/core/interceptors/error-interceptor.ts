import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((err) => {
      if (err?.status === 401) {
        localStorage.removeItem('studyhub_token');
        try {
          router.navigate(['/auth/login']);
        } catch (e) {
          
        }
      }
      return throwError(() => err);
    })
  );
};
