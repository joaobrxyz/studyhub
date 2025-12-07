import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth'
import Swal from 'sweetalert2';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const router = inject(Router);
  const authService = inject(Auth);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Se o erro for 401 (Não autorizado/Token expirado) ou 403 (Proibido)
      if (error.status === 401 || error.status === 403) {
        
        // Faz o logout para limpar o token velho do localStorage
        authService.logout(); 

        Swal.fire({
            title: 'Sessão Expirada',
            text: 'Por segurança, faça login novamente.',
            icon: 'warning',
            confirmButtonText: 'OK',
            confirmButtonColor: '#0d6efd'
        }).then(() => {
             // Redireciona para o login
             router.navigate(['/auth/login']);
        });
      }

      return throwError(() => error);
    })
  );
};