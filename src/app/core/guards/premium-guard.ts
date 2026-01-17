import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../../features/profile/services/user-service';
import { map, take } from 'rxjs';
import Swal from 'sweetalert2';

export const premiumGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.getUsuarioLogado().pipe(
    take(1),
    map(user => {
      if (user?.premium) {
        return true; // Liberado!
      } else {
        // Bloqueado: Mostra aviso e manda para o Premium
        Swal.fire({
          title: 'Acesso Restrito 👑',
          text: 'Essa funcionalidade é exclusiva para membros do StudyHub premium.',
          icon: 'warning',
          confirmButtonText: 'Conhecer StudyHub premium',
          confirmButtonColor: '#f59e0b'
        });
        
        router.navigate(['/premium']);
        return false;
      }
    })
  );
};