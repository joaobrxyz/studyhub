import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  
  // Injeta as dependências necessárias dentro da função
  const authService = inject(Auth);
  const router = inject(Router);

  // Verifica se o usuário possui um token válido
  if (authService.isLoggedIn()) {
    return true; // Permite o acesso à rota
  } else {
    // Se não estiver logado, redireciona para o login
    
    router.navigate(['/auth/login']);
    return false; // Bloqueia o acesso
  }
};